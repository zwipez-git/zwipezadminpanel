// import pool from "../../db/db.js";
// /// 🏪 GET ORDERS FOR SHOP
// export const getShopOrders = async (req, res) => {
//   try {
//     const { shop_id } = req.params;

//     if (!shop_id) {
//       return res.status(400).json({
//         status: 0,
//         message: "shop_id required",
//       });
//     }

//     const result = await pool.query(
//       `SELECT 
//         o.id,
//         o.order_number,
//         o.customer_id,
//         o.grand_total,
//         o.status,
//         o.created_at
//        FROM orders o
//        WHERE o.shop_id = $1
//        ORDER BY o.created_at DESC`,
//       [shop_id]
//     );

//     res.json({
//       status: 1,
//       message: "Shop orders fetched",
//       data: result.rows,
//     });

//   } catch (err) {
//     console.error("Shop order error:", err);
//     res.status(500).json({
//       status: 0,
//       message: "Server error",
//     });
//   }
// };
import pool from "../../db/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret";
const generate4DigitOtp = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

const getShopIdFromToken = (req) => {
  const accessToken =
    req.headers.accesstoken || req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return { error: "Access token required", code: 401 };
  }

  const decoded = jwt.verify(accessToken, JWT_SECRET);
  const shopId = decoded.shop_id;

  if (!shopId) {
    return { error: "Shop not found in token", code: 400 };
  }

  return { shopId };
};

const fetchShopOrders = async (shopId) => {
  const result = await pool.query(
    `SELECT 
      o.id,
      o.order_number,
      o.customer_id,
      o.grand_total,
      o.status,
      o.shop_action,
      o.created_at,
      o.shop_id,
      json_agg(
        json_build_object(
          'name', p.name,
          'quantity', oi.quantity
        )
      ) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     WHERE o.shop_id = $1
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [shopId]
  );

  const newOrders = result.rows.filter(
    (o) =>
      o.status === "CREATED" &&
      (o.shop_action === "PENDING" || o.shop_action === null)
  );
  const preparing = result.rows.filter((o) => o.status === "PREPARING");
  const readyForPickup = result.rows.filter(
    (o) => o.status === "READY" || o.status === "READY_FOR_PICKUP"
  );

  return {
    allOrders: result.rows,
    newOrders,
    preparing,
    readyForPickup,
  };
};

const updateOrderStatusWithLog = async ({
  shopId,
  orderId,
  fromStatus,
  toStatus,
  shopAction,
  logTable,
  logColumns,
  logValues,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT id, status FROM orders WHERE id = $1 AND shop_id = $2`,
      [orderId, shopId]
    );

    if (!orderResult.rows.length) {
      return { error: "Order not found", code: 404 };
    }

    const currentStatus = orderResult.rows[0].status;
    if (currentStatus !== fromStatus) {
      return {
        error: `Only ${fromStatus} orders can move to ${toStatus}`,
        code: 400,
      };
    }

    await client.query(
      `UPDATE orders 
       SET status = $1, 
           shop_action = COALESCE($2, shop_action)
       WHERE id = $3`,
      [toStatus, shopAction || null, orderId]
    );

    if (logTable) {
      // ensure only one decision row per order+shop
      const cols = ["shop_id", "order_id", ...logColumns];
      const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(",");
      const values = [shopId, orderId, ...logValues];

      await client.query(
        `INSERT INTO ${logTable} (${cols.join(",")})
         VALUES (${placeholders})
         ON CONFLICT (shop_id, order_id) DO UPDATE SET
         ${logColumns
           .map((c) => `${c}=EXCLUDED.${c}`)
           .concat(["updated_at=NOW()"])
           .join(", ")}`,
        values
      );
    }

    await client.query("COMMIT");
    return { ok: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/// 🏪 GET ORDERS FOR LOGGED-IN SHOP (GROUPED)
export const getShopOrders = async (req, res) => {
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const grouped = await fetchShopOrders(auth.shopId);
    return res.json({
      status: 1,
      message: "Shop orders fetched",
      data: grouped,
    });
  } catch (err) {
    console.error("Shop order error:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }

    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

/// ✅ ACCEPT ORDER (CREATED -> PREPARING) + LOG IN shop_order_accepts
export const acceptShopOrder = async (req, res) => {
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const { order_id } = req.params;
    if (!order_id) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }

    const result = await updateOrderStatusWithLog({
      shopId: auth.shopId,
      orderId: Number(order_id),
      fromStatus: "CREATED",
      toStatus: "PREPARING",
      shopAction: "ACCEPTED",
      logTable: "shop_order_accepts",
      logColumns: [],
      logValues: [],
    });

    if (result?.error) {
      return res.status(result.code).json({ status: 0, message: result.error });
    }

    return res.json({
      status: 1,
      message: "Order accepted and moved to preparing",
      data: { order_id: Number(order_id), status: "PREPARING" },
    });
  } catch (err) {
    console.error("Accept order error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

/// ❌ REJECT ORDER (CREATED -> CANCELLED) + LOG IN shop_order_rejects
export const rejectShopOrder = async (req, res) => {
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const { order_id } = req.params;
    const { reason } = req.body || {};

    if (!order_id) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }

    const result = await updateOrderStatusWithLog({
      shopId: auth.shopId,
      orderId: Number(order_id),
      fromStatus: "CREATED",
      toStatus: "CANCELLED",
      shopAction: "REJECTED",
      logTable: "shop_order_rejects",
      logColumns: ["reason"],
      logValues: [reason || null],
    });

    if (result?.error) {
      return res.status(result.code).json({ status: 0, message: result.error });
    }

    return res.json({
      status: 1,
      message: "Order rejected",
      data: { order_id: Number(order_id), status: "CANCELLED" },
    });
  } catch (err) {
    console.error("Reject order error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

/// ✅ READY FOR PICKUP (PREPARING -> READY)
export const markShopOrderReadyForPickup = async (req, res) => {
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const { order_id } = req.params;
    if (!order_id) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }

    const result = await updateOrderStatusWithLog({
      shopId: auth.shopId,
      orderId: Number(order_id),
      fromStatus: "PREPARING",
      toStatus: "READY",
      shopAction: null,
      logTable: null,
      logColumns: [],
      logValues: [],
    });

    if (result?.error) {
      return res.status(result.code).json({ status: 0, message: result.error });
    }

    const pickupOtp = generate4DigitOtp();
    await pool.query(
      `INSERT INTO order_pickup_otps (order_id, shop_id, otp, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
       ON CONFLICT (order_id) DO UPDATE SET
         otp = EXCLUDED.otp,
         expires_at = EXCLUDED.expires_at,
         verified_at = NULL,
         verified_by_shop_id = NULL,
         updated_at = NOW()`,
      [Number(order_id), auth.shopId, pickupOtp]
    );

    return res.json({
      status: 1,
      message: "Order moved to ready for pickup and pickup OTP generated",
      data: {
        order_id: Number(order_id),
        status: "READY",
        pickup_otp: pickupOtp,
        pickup_otp_validity_hours: 24,
      },
    });
  } catch (err) {
    console.error("Ready for pickup error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};