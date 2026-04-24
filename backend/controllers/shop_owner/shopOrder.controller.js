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

/// 🏪 GET ORDERS FOR LOGGED-IN SHOP
export const getShopOrders = async (req, res) => {
  try {
    const accessToken = req.headers.accesstoken;

    if (!accessToken) {
      return res.status(401).json({
        status: 0,
        message: "Access token required",
      });
    }

    // 🔐 Decode token
    const decoded = jwt.verify(accessToken, JWT_SECRET);

    const shopId = decoded.shopId;

    if (!shopId) {
      return res.status(400).json({
        status: 0,
        message: "Shop not found in token",
      });
    }

    // 🧾 Fetch only this shop orders
   const result = await pool.query(
  `SELECT 
    o.id,
    o.order_number,
    o.customer_id,
    o.grand_total,
    o.status,
    o.created_at,
    o.shop_id,

    -- 🔥 IMPORTANT: ITEMS ARRAY
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

    return res.json({
      status: 1,
      message: "Shop orders fetched",
      data: result.rows,
    });

  } catch (err) {
    console.error("Shop order error:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: 0,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      status: 0,
      message: "Server error",
    });
  }
};