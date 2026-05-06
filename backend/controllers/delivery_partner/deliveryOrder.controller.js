import pool from "../../db/db.js";

/// Orders that shops have accepted (rows in shop_order_accepts), with shop + line items
// export const getShopAcceptedOrders = async (req, res) => {
//   try {
//     if (req.user?.role !== "delivery_partner") {
//       return res
//         .status(403)
//         .json({ status: 0, message: "Delivery partner access only" });
//     }

//     const result = await pool.query(
//       `SELECT
//         soa.id AS accept_id,
//         soa.shop_id,
//         soa.order_id,
//         soa.accepted_at,
//         o.*,
//         s.shop_name,
//         s.phone_number AS shop_phone,
//         s.address AS shop_address,
//         c.name AS customer_name,
//         c.phone_number AS customer_phone,
//         COALESCE(
//           json_agg(
//             json_build_object(
//               'product_name', p.name,
//               'quantity', oi.quantity,
//               'price', oi.price
//             )
//           ) FILTER (WHERE oi.id IS NOT NULL),
//           '[]'
//         ) AS items
//        FROM shop_order_accepts soa
//        INNER JOIN orders o ON o.id = soa.order_id
//        INNER JOIN shops s ON s.shop_id = soa.shop_id
//        LEFT JOIN customers c ON c.id = o.customer_id
//        LEFT JOIN order_items oi ON oi.order_id = o.id
//        LEFT JOIN products p ON p.id = oi.product_id
//        GROUP BY o.id, soa.id, s.shop_id, c.id
//        ORDER BY soa.accepted_at DESC`
//     );

//     return res.json({
//       status: 1,
//       message: "Shop-accepted orders fetched",
//       data: result.rows,
//     });
//   } catch (err) {
//     console.error("Delivery partner orders error:", err);
//     return res.status(500).json({ status: 0, message: "Server error" });
//   }
// };
export const getShopAcceptedOrders = async (req, res) => {
  try {
    if (req.user?.role !== "delivery_partner") {
      return res
        .status(403)
        .json({
          status: 0,
          message: "Delivery partner access only",
        });
    }

    const result = await pool.query(
      `SELECT
        o.id AS order_id,
        o.order_number,
        o.customer_id,
        o.total_amount,
        o.tax,
        o.delivery_charge,
        o.grand_total,
        o.address,
        o.payment_method,
        o.status,
        o.created_at,
        o.shop_id,
        o.instructions,

        s.shop_name,
        s.phone_number AS shop_phone,
        s.address AS shop_address,

        c.name AS customer_name,
        c.phone_number AS customer_phone,

        soa.delivery_partner_accepted,

        COALESCE(
          json_agg(
            json_build_object(
              'product_name', p.name,
              'quantity', oi.quantity,
              'price', oi.price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items

       FROM orders o

       INNER JOIN shops s
       ON s.shop_id = o.shop_id

       INNER JOIN shop_order_accepts soa
       ON soa.order_id = o.id

       LEFT JOIN customers c
       ON c.id = o.customer_id

       LEFT JOIN order_items oi
       ON oi.order_id = o.id

       LEFT JOIN products p
       ON p.id = oi.product_id

       WHERE o.shop_action = 'ACCEPTED'
       AND soa.delivery_partner_accepted = false

       GROUP BY o.id, s.shop_id, c.id, soa.delivery_partner_accepted

       ORDER BY o.created_at DESC`
    );

    return res.json({
      status: 1,
      message: "Shop accepted orders fetched",
      data: result.rows,
    });

  } catch (err) {
    console.error("Delivery partner orders error:", err);

    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};
/// Delivery partner accepts / claims an order (must exist in shop_order_accepts). Amounts are copied from orders.
export const acceptDeliveryPartnerOrder = async (req, res) => {
  if (req.user?.role !== "delivery_partner") {
    return res
      .status(403)
      .json({ status: 0, message: "Delivery partner access only" });
  }
console.log("🔥 ACCEPT API HIT");

console.log(req.body);

console.log(req.user);
  // const deliveryPartnerId = req.user.deliveryId;
  const deliveryPartnerId =
  req.user.deliveryId || req.user.id;
  if (!deliveryPartnerId) {
    return res.status(400).json({
      status: 0,
      message: "Complete delivery registration before accepting orders",
    });
  }

  const orderIdRaw = req.body?.order_id ?? req.body?.orderId;
  const order_id = Number(orderIdRaw);
  if (!orderIdRaw || Number.isNaN(order_id)) {
    return res.status(400).json({ status: 0, message: "order_id required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const orderLock = await client.query(
      `SELECT id, shop_id, customer_id FROM orders WHERE id = $1 FOR UPDATE`,
      [order_id]
    );

    if (!orderLock.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ status: 0, message: "Order not found" });
    }

    const { shop_id } = orderLock.rows[0];

    const shopAccepted = await client.query(
      `SELECT 1 FROM shop_order_accepts
       WHERE order_id = $1 AND shop_id = $2`,
      [order_id, shop_id]
    );

    if (!shopAccepted.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: 0,
        message: "Shop has not accepted this order yet",
      });
    }

    const insertResult = await client.query(
      `INSERT INTO delivery_partner_order_accepts (
        delivery_partner_id, order_id, shop_id, customer_id,
        order_number, total_amount, tax, discount, delivery_charge, grand_total,
        coupon_code, payment_method, address, instructions
      )
      SELECT
        $1,
        o.id,
        o.shop_id,
        o.customer_id,
        o.order_number,
        o.total_amount,
        COALESCE(o.tax, 0),
        COALESCE(o.discount, 0),
        COALESCE(o.delivery_charge, 0),
        o.grand_total,
        o.coupon_code,
        o.payment_method,
        o.address,
        o.instructions
      FROM orders o
      WHERE o.id = $2
      ON CONFLICT (order_id) DO NOTHING
      RETURNING *`,
      [deliveryPartnerId, order_id]
    );

    if (insertResult.rows.length > 0) {
      await client.query(
  `UPDATE shop_order_accepts
   SET delivery_partner_accepted = true,
       updated_at = NOW()
   WHERE order_id = $1`,
  [order_id]
);
      await client.query("COMMIT");
      return res.status(201).json({
        status: 1,
        message: "Order accepted",
        data: insertResult.rows[0],
      });
    }

    const existing = await client.query(
      `SELECT * FROM delivery_partner_order_accepts WHERE order_id = $1`,
      [order_id]
    );

    await client.query("COMMIT");

    const row = existing.rows[0];
    if (Number(row.delivery_partner_id) === Number(deliveryPartnerId)) {
      return res.json({
        status: 1,
        message: "Already accepted by you",
        data: row,
      });
    }

    return res.status(409).json({
      status: 0,
      message: "Order already assigned to another delivery partner",
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Delivery accept order error:", err);
    return res.status(500).json({ status: 0, message: "Server error" });
  } finally {
    client.release();
  }
};

/// Mark delivery result as delivery/refund for claimed order
export const markDeliveryOutcome = async (req, res) => {
  try {
    if (req.user?.role !== "delivery_partner") {
      return res
        .status(403)
        .json({ status: 0, message: "Delivery partner access only" });
    }

    const deliveryPartnerId = req.user.deliveryId || req.user.id;
    if (!deliveryPartnerId) {
      return res.status(400).json({
        status: 0,
        message: "Complete delivery registration before updating order",
      });
    }

    const orderIdRaw = req.body?.order_id ?? req.body?.orderId;
    const order_id = Number(orderIdRaw);
    const outcomeRaw = req.body?.outcome ?? req.body?.delivery_outcome;
    const delivery_outcome = String(outcomeRaw || "")
      .trim()
      .toUpperCase();

    if (!orderIdRaw || Number.isNaN(order_id)) {
      return res.status(400).json({ status: 0, message: "order_id required" });
    }

    if (!["DELIVERY", "REFUND"].includes(delivery_outcome)) {
      return res.status(400).json({
        status: 0,
        message: "outcome must be DELIVERY or REFUND",
      });
    }

    const updated = await pool.query(
      `UPDATE delivery_partner_order_accepts
       SET delivery_outcome = $1,
           delivered_at = NOW(),
           updated_at = NOW()
       WHERE order_id = $2
         AND delivery_partner_id = $3
       RETURNING *`,
      [delivery_outcome, order_id, deliveryPartnerId]
    );

    if (!updated.rows.length) {
      return res.status(404).json({
        status: 0,
        message: "Order not found for this delivery partner",
      });
    }

    await pool.query(`UPDATE orders SET status = 'COMPLETED' WHERE id = $1`, [
      order_id,
    ]);

    return res.json({
      status: 1,
      message: "Delivery outcome updated",
      data: updated.rows[0],
    });
  } catch (err) {
    console.error("Delivery outcome update error:", err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};
