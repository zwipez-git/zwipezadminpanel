import jwt from "jsonwebtoken";
import pool from "../../db/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret";
const PICKUP_OTP_VALIDITY_HOURS = 24;

const getShopIdFromToken = (req) => {
  const accessToken =
    req.headers.accesstoken || req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return { error: "Access token required", code: 401 };
  }

  const decoded = jwt.verify(accessToken, JWT_SECRET);
  const shopId = decoded.shopId;

  if (!shopId) {
    return { error: "Shop not found in token", code: 400 };
  }

  return { shopId };
};

const generate4DigitOtp = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

export const createOrRefreshPickupOtp = async (req, res) => {
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const { order_id } = req.params;
    if (!order_id) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }

    const orderResult = await pool.query(
      `SELECT id, status
       FROM orders
       WHERE id = $1 AND shop_id = $2`,
      [Number(order_id), auth.shopId]
    );

    if (!orderResult.rows.length) {
      return res.status(404).json({ status: 0, message: "Order not found" });
    }

    const status = orderResult.rows[0].status;
    if (status !== "READY" && status !== "READY_FOR_PICKUP") {
      return res.status(400).json({
        status: 0,
        message: "Pickup OTP can be created only for ready orders",
      });
    }

    const otp = generate4DigitOtp();

    const otpResult = await pool.query(
      `INSERT INTO order_pickup_otps (order_id, shop_id, otp, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
       ON CONFLICT (order_id) DO UPDATE SET
         otp = EXCLUDED.otp,
         expires_at = EXCLUDED.expires_at,
         verified_at = NULL,
         verified_by_shop_id = NULL,
         updated_at = NOW()
       RETURNING order_id, otp, expires_at`,
      [Number(order_id), auth.shopId, otp]
    );

    return res.json({
      status: 1,
      message: `Pickup OTP created with ${PICKUP_OTP_VALIDITY_HOURS} hour validity`,
      data: otpResult.rows[0],
    });
  } catch (err) {
    console.error("Create pickup OTP error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

export const getPickupOtpStatus = async (req, res) => {
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const { order_id } = req.params;
    if (!order_id) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }

    const result = await pool.query(
      `SELECT
          o.id AS order_id,
          o.status,
          po.otp,
          po.expires_at,
          po.verified_at,
          GREATEST(
            FLOOR(EXTRACT(EPOCH FROM (po.expires_at - NOW())) / 60),
            0
          )::INT AS minutes_left
       FROM orders o
       LEFT JOIN order_pickup_otps po
         ON po.order_id = o.id AND po.shop_id = o.shop_id
       WHERE o.id = $1 AND o.shop_id = $2`,
      [Number(order_id), auth.shopId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ status: 0, message: "Order not found" });
    }

    return res.json({
      status: 1,
      message: "Pickup OTP status fetched",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Get pickup OTP status error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

export const verifyPickupOtpAndMarkPickedUp = async (req, res) => {
  const client = await pool.connect();
  try {
    const auth = getShopIdFromToken(req);
    if (auth.error) {
      return res.status(auth.code).json({ status: 0, message: auth.error });
    }

    const { order_id } = req.params;
    const { otp } = req.body || {};

    if (!order_id) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }
    if (!otp) {
      return res.status(400).json({ status: 0, message: "otp required" });
    }

    await client.query("BEGIN");

    const orderResult = await client.query(
      `SELECT id, status
       FROM orders
       WHERE id = $1 AND shop_id = $2
       FOR UPDATE`,
      [Number(order_id), auth.shopId]
    );

    if (!orderResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ status: 0, message: "Order not found" });
    }

    const orderStatus = orderResult.rows[0].status;
    if (orderStatus !== "READY" && orderStatus !== "READY_FOR_PICKUP") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 0,
        message: "Only ready orders can be marked picked up",
      });
    }

    const otpResult = await client.query(
      `SELECT id, otp, expires_at, verified_at
       FROM order_pickup_otps
       WHERE order_id = $1 AND shop_id = $2
       FOR UPDATE`,
      [Number(order_id), auth.shopId]
    );

    if (!otpResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 0,
        message: "Pickup OTP not generated for this order",
      });
    }

    const pickupOtp = otpResult.rows[0];

    if (pickupOtp.verified_at) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 0,
        message: "Pickup OTP already verified",
      });
    }

    if (new Date(pickupOtp.expires_at) <= new Date()) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 0,
        message: "Pickup OTP expired. Generate a new OTP.",
      });
    }

    if (pickupOtp.otp !== String(otp).trim()) {
      await client.query("ROLLBACK");
      return res.status(400).json({ status: 0, message: "Invalid pickup OTP" });
    }

    await client.query(
      `UPDATE order_pickup_otps
       SET verified_at = NOW(),
           verified_by_shop_id = $2,
           updated_at = NOW()
       WHERE order_id = $1`,
      [Number(order_id), auth.shopId]
    );

    await client.query(
      `UPDATE orders
       SET status = 'PICKED_UP'
       WHERE id = $1 AND shop_id = $2`,
      [Number(order_id), auth.shopId]
    );

    await client.query("COMMIT");

    return res.json({
      status: 1,
      message: "Pickup OTP verified. Order marked as picked up",
      data: { order_id: Number(order_id), status: "PICKED_UP" },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Verify pickup OTP error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ status: 0, message: "Invalid token" });
    }
    return res.status(500).json({ status: 0, message: "Server error" });
  } finally {
    client.release();
  }
};
