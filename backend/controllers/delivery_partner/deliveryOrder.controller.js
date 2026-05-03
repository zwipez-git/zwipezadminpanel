import pool from "../../db/db.js";

/// Orders that shops have accepted (rows in shop_order_accepts), with shop + line items
export const getShopAcceptedOrders = async (req, res) => {
  try {
    if (req.user?.role !== "delivery_partner") {
      return res
        .status(403)
        .json({ status: 0, message: "Delivery partner access only" });
    }

    const result = await pool.query(
      `SELECT
        soa.id AS accept_id,
        soa.shop_id,
        soa.order_id,
        soa.accepted_at,
        o.*,
        s.shop_name,
        s.phone_number AS shop_phone,
        s.address AS shop_address,
        c.name AS customer_name,
        c.phone_number AS customer_phone,
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
       FROM shop_order_accepts soa
       INNER JOIN orders o ON o.id = soa.order_id
       INNER JOIN shops s ON s.shop_id = soa.shop_id
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       GROUP BY o.id, soa.id, s.shop_id, c.id
       ORDER BY soa.accepted_at DESC`
    );

    return res.json({
      status: 1,
      message: "Shop-accepted orders fetched",
      data: result.rows,
    });
  } catch (err) {
    console.error("Delivery partner orders error:", err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};
