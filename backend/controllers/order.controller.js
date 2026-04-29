import pool from '../db/db.js';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret";

export const checkout = async (req, res) => {

  // const accessToken = req.headers.accesstoken;
  const authHeader = req.headers.authorization;

if (!authHeader) {
  return res.status(401).json({ message: "Unauthorized" });
}

const accessToken = authHeader.split(" ")[1];
  const id = req.headers.id;

  const { address, payment_method, shop_id } = req.body;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Access token and customerId required" });
  }

  if (!address || !payment_method) {
    return res.status(400).json({ message: "Address and payment method required" });
  }

  try {

    const decoded = jwt.verify(accessToken, JWT_SECRET);

    if (decoded.customerId != id) {
      return res.status(401).json({ message: "Customer ID mismatch" });
    }

   
    const cartRes = await pool.query(
      `SELECT id FROM carts
       WHERE customer_id = $1 AND status = 'ACTIVE'`,
      [id]
    );

    if (!cartRes.rows.length) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartId = cartRes.rows[0].id;


    const itemsRes = await pool.query(
      `SELECT
        ci.product_id,
        p.name AS product_name,
        ci.quantity,
        ci.price,
        ci.total
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    if (itemsRes.rows.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = itemsRes.rows.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );

    const tax = Math.round(totalAmount * 0.18 * 100) / 100;
    const deliveryCharge = totalAmount === 0 ? 0 : (totalAmount >= 400 ? 0 : 40);

    // const grandTotal = totalAmount + tax + deliveryCharge;
    const grandTotal = totalAmount + tax + deliveryCharge - discount;

    res.json({
      customer_id: id,
      items: itemsRes.rows,
      address,
      payment_method,
      totalAmount,
      tax,
      deliveryCharge,
      grandTotal
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Checkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



//place order

// export const placeOrder = async (req, res) => {
//   const accessToken = req.headers.accesstoken;
//   const id = req.headers.id;

//   // const { address, payment_method, shop_id } = req.body;
// const { address, payment_method } = req.body;
//   //  validation
//   if (!accessToken || !id) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   if (!address || !payment_method) {
//     return res.status(400).json({ message: "Address & payment required" });
//   }

//   // if (!shop_id) {
//   //   return res.status(400).json({ message: "shop_id required" });
//   // }

//   try {
//     const decoded = jwt.verify(accessToken, JWT_SECRET);

//     if (decoded.customerId != id) {
//       return res.status(401).json({ message: "Customer mismatch" });
//     }

//     const client = await pool.connect();

//     try {
//       await client.query("BEGIN");

//       // 🛒 Get cart
//       const cartRes = await client.query(
//         `SELECT id FROM carts WHERE customer_id=$1 AND status='ACTIVE'`,
//         [id]
//       );

//       if (!cartRes.rows.length) {
//         throw new Error("Cart not found");
//       }

//       const cartId = cartRes.rows[0].id;

//       // 🧾 Get items
//       const itemsRes = await client.query(
//         `SELECT * FROM cart_items WHERE cart_id=$1`,
//         [cartId]
//       );

//       if (itemsRes.rows.length === 0) {
//         throw new Error("Cart is empty");
//       }

//       // 💰 Calculate
//       const totalAmount = itemsRes.rows.reduce(
//         (sum, item) => sum + Number(item.total),
//         0
//       );

//       const tax = Math.round(totalAmount * 0.18 * 100) / 100;
//       const deliveryCharge = totalAmount >= 400 ? 0 : 40;
//       const grandTotal = totalAmount + tax + deliveryCharge;

//       // ✅ INSERT ORDER (FIXED with shop_id)
//       // 🔥 GET SHOP ID FROM CART
// const shopRes = await client.query(
//   `SELECT shop_id FROM cart_items WHERE cart_id = $1 LIMIT 1`,
//   [cartId]
// );

// if (!shopRes.rows.length || !shopRes.rows[0].shop_id) {
//   throw new Error("Shop not found in cart");
// }

// const shop_id = shopRes.rows[0].shop_id;


// // ✅ ONLY INSERT (FINAL)
// const orderRes = await client.query(
//   `INSERT INTO orders
//   (customer_id, shop_id, total_amount, tax, delivery_charge, grand_total, address, payment_method)
//   VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//   RETURNING id`,
//   [id, shop_id, totalAmount, tax, deliveryCharge, grandTotal, address, payment_method]
// );

// const orderId = orderRes.rows[0].id; // ✅ ONLY ONCE

// const orderNumber = `ORD-${1000 + orderId}`;

// await client.query(
//   `UPDATE orders SET order_number=$1 WHERE id=$2`,
//   [orderNumber, orderId]
// );
//       // const orderRes = await client.query(
//       //   `INSERT INTO orders
//       //   (customer_id, shop_id, total_amount, tax, delivery_charge, grand_total, address, payment_method)
//       //   VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//       //   RETURNING id`,
//       //   [id, shop_id, totalAmount, tax, deliveryCharge, grandTotal, address, payment_method]
//       // );

//       // const orderId = orderRes.rows[0].id;

//       // const orderNumber = `ORD-${1000 + orderId}`;

//       await client.query(
//         `UPDATE orders SET order_number=$1 WHERE id=$2`,
//         [orderNumber, orderId]
//       );

//       // 📦 Insert items
//       for (const item of itemsRes.rows) {
//         const itemTax = Math.round(Number(item.total) * 0.18 * 100) / 100;

//         const itemDelivery =
//           totalAmount >= 400
//             ? 0
//             : Math.round((40 / itemsRes.rows.length) * 100) / 100;

//         await client.query(
//           `INSERT INTO order_items
//           (order_id, product_id, quantity, price, tax, delivery_charge, total)
//           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//           [
//             orderId,
//             item.product_id,
//             item.quantity,
//             item.price,
//             itemTax,
//             itemDelivery,
//             item.total,
//           ]
//         );
//       }

//       // 🧹 Clear cart
//       await client.query(
//         `UPDATE carts SET status='ORDERED' WHERE id=$1`,
//         [cartId]
//       );

//       await client.query(
//         `DELETE FROM cart_items WHERE cart_id=$1`,
//         [cartId]
//       );

//       await client.query("COMMIT");

//       res.json({
//         message: "Order placed successfully",
//         order_id: orderId,
//         order_number: orderNumber,
//         shop_id: shop_id, // ✅ useful for frontend
//         grand_total: grandTotal,
//       });

//     } catch (err) {
//       await client.query("ROLLBACK");
//       throw err;
//     } finally {
//       client.release();
//     }

//   } catch (err) {
//     console.error("Order error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

export const placeOrder = async (req, res) => {
  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  // const { address, payment_method, shop_id } = req.body;
// const { address, payment_method } = req.body;
const { address, payment_method, coupon_code, instructions } = req.body;
  //  validation
  if (!accessToken || !id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!address || !payment_method) {
    return res.status(400).json({ message: "Address & payment required" });
  }

  // if (!shop_id) {
  //   return res.status(400).json({ message: "shop_id required" });
  // }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);

    if (decoded.customerId != id) {
      return res.status(401).json({ message: "Customer mismatch" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 🛒 Get cart
      const cartRes = await client.query(
        `SELECT id FROM carts WHERE customer_id=$1 AND status='ACTIVE'`,
        [id]
      );

      if (!cartRes.rows.length) {
        throw new Error("Cart not found");
      }

      const cartId = cartRes.rows[0].id;

      // 🧾 Get items
      const itemsRes = await client.query(
        `SELECT * FROM cart_items WHERE cart_id=$1`,
        [cartId]
      );

      if (itemsRes.rows.length === 0) {
        throw new Error("Cart is empty");
      }

      // 💰 Calculate
      const totalAmount = itemsRes.rows.reduce(
        (sum, item) => sum + Number(item.total),
        0
      );

      const tax = Math.round(totalAmount * 0.18 * 100) / 100;
      const deliveryCharge = totalAmount >= 400 ? 0 : 40;
      const grandTotal = totalAmount + tax + deliveryCharge;

      // ✅ INSERT ORDER (FIXED with shop_id)
      // 🔥 GET SHOP ID FROM CART
// const shopRes = await client.query(
//   `SELECT shop_id FROM cart_items WHERE cart_id = $1 LIMIT 1`,
//   [cartId]
// );

// if (!shopRes.rows.length || !shopRes.rows[0].shop_id) {
//   throw new Error("Shop not found in cart");
// }

// const shop_id = shopRes.rows[0].shop_id;
const shopRes = await client.query(
  `SELECT p.shop_id 
   FROM cart_items ci
   JOIN products p ON p.id = ci.product_id
   WHERE ci.cart_id = $1
   LIMIT 1`,
  [cartId]
);

if (!shopRes.rows.length || !shopRes.rows[0].shop_id) {
  throw new Error("Shop not found in products");
}

const shop_id = shopRes.rows[0].shop_id;

let discount = 0;

if (coupon_code) {
  const couponRes = await client.query(
    `SELECT * FROM coupons 
     WHERE code=$1 AND is_active=true 
     AND (expires_at IS NULL OR expires_at > NOW())`,
    [coupon_code]
  );

  if (couponRes.rows.length) {
    const coupon = couponRes.rows[0];

    if (totalAmount >= coupon.min_order) {

      if (coupon.type === "percent") {
        discount = totalAmount * (coupon.value / 100);

        if (coupon.max_discount) {
          discount = Math.min(discount, coupon.max_discount);
        }
      }

      if (coupon.type === "flat") {
        discount = coupon.value;
      }

      // ✅ store usage NOW (correct place)
      await client.query(
        `INSERT INTO coupon_usage(customer_id, coupon_id)
         VALUES($1,$2)`,
        [id, coupon.id]
      );
    }
  }
}

// ✅ ONLY INSERT (FINAL)
// const orderRes = await client.query(
//   `INSERT INTO orders
//   (customer_id, shop_id, total_amount, tax,discount, delivery_charge, grand_total, coupon_code, address, payment_method)
//   VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//   RETURNING id`,
//   [id, shop_id, totalAmount, tax, deliveryCharge, discount, grandTotal,  coupon_code,address, payment_method]
// );

// ✅ FINAL INSERT (WITH INSTRUCTIONS)
const orderRes = await client.query(
  `INSERT INTO orders
  (customer_id, shop_id, total_amount, tax, discount, delivery_charge, grand_total, coupon_code, address, payment_method, instructions)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  RETURNING id`,
  [
    id,
    shop_id,
    totalAmount,
    tax,
    discount,
    deliveryCharge,
    grandTotal,
    coupon_code,
    address,
    payment_method,
    instructions
  ]
);
const orderId = orderRes.rows[0].id; // ✅ ONLY ONCE

const orderNumber = `ORD-${1000 + orderId}`;

await client.query(
  `UPDATE orders SET order_number=$1 WHERE id=$2`,
  [orderNumber, orderId]
);
      // const orderRes = await client.query(
      //   `INSERT INTO orders
      //   (customer_id, shop_id, total_amount, tax, delivery_charge, grand_total, address, payment_method)
      //   VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      //   RETURNING id`,
      //   [id, shop_id, totalAmount, tax, deliveryCharge, grandTotal, address, payment_method]
      // );

      // const orderId = orderRes.rows[0].id;

      // const orderNumber = `ORD-${1000 + orderId}`;

      await client.query(
        `UPDATE orders SET order_number=$1 WHERE id=$2`,
        [orderNumber, orderId]
      );

      // 📦 Insert items
      for (const item of itemsRes.rows) {
        const itemTax = Math.round(Number(item.total) * 0.18 * 100) / 100;

        const itemDelivery =
          totalAmount >= 400
            ? 0
            : Math.round((40 / itemsRes.rows.length) * 100) / 100;

        await client.query(
          `INSERT INTO order_items
          (order_id, product_id, quantity, price, tax, delivery_charge, total)
          VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            itemTax,
            itemDelivery,
            item.total,
          ]
        );
      }

      // 🧹 Clear cart
      await client.query(
        `UPDATE carts SET status='ORDERED' WHERE id=$1`,
        [cartId]
      );

      await client.query(
        `DELETE FROM cart_items WHERE cart_id=$1`,
        [cartId]
      );

      await client.query("COMMIT");

      res.json({
        message: "Order placed successfully",
        order_id: orderId,
        order_number: orderNumber,
        shop_id: shop_id, // ✅ useful for frontend
        grand_total: grandTotal,
      });

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: err.message });
  }
};



//get orders

export const getOrders = async (req, res) => {
  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  try {

  

    if (accessToken && id) {

      const decoded = jwt.verify(accessToken, JWT_SECRET);

      if (decoded.customerId != id) {
        return res.status(401).json({
          status: 0,
          message: "Customer ID mismatch",
        });
      }

      const result = await pool.query(
        `SELECT id, order_number, customer_id, grand_total, status, created_at
         FROM orders
         WHERE customer_id = $1
         ORDER BY created_at DESC`,
        [id]
      );

      return res.json({
        status: 1,
        message: "Customer orders fetched",
        data: result.rows,
      });
    }


   

    const result = await pool.query(
      `SELECT id, order_number, customer_id, grand_total, status, created_at
       FROM orders
       ORDER BY created_at DESC`
    );

    return res.json({
      status: 1,
      message: "All orders fetched",
      data: result.rows,
    });

  } catch (err) {

    console.log("Token error:", err.message);

  

    try {

      const result = await pool.query(
        `SELECT id, order_number, customer_id, grand_total, status, created_at
         FROM orders
         ORDER BY created_at DESC`
      );

      return res.json({
        status: 1,
        message: "All orders fetched (no token)",
        data: result.rows,
      });

    } catch (dbErr) {
      console.log(dbErr);

      return res.status(500).json({
        status: 0,
        message: "Server error",
      });
    }
  }
};
//get order details

export const getOrderDetailsCustomer = async (req, res) => {
  try {
    const accessToken = req.headers.accesstoken;
    const id = req.headers.id;
    const { order_id } = req.params;

   
    if (!accessToken || !id) {
      return res.status(401).json({
        message: "Unauthorized - token required"
      });
    }

    const decoded = jwt.verify(accessToken, JWT_SECRET);

    if (decoded.customerId != id) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const orderRes = await pool.query(
      `SELECT id, order_number, customer_id, grand_total, status, created_at, address, payment_method
       FROM orders
       WHERE id=$1 AND customer_id=$2`,
      [order_id, id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const itemsRes = await pool.query(
      `SELECT
        oi.product_id,
        p.name,
        oi.quantity,
        oi.price,
        oi.tax,
        oi.total
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id=$1`,
      [order_id]
    );

    const items = itemsRes.rows;

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );

    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const deliveryCharge = subtotal >= 400 ? 0 : 40;
    // const grandTotal = subtotal + tax + deliveryCharge;
const grandTotal = totalAmount + tax + deliveryCharge - discount;
    return res.json({
      order: orderRes.rows[0],
      items,
      summary: {
        subtotal,
        tax,
        deliveryCharge,
        grandTotal
      }
    });

  } catch (err) {
    console.log("Order details error:", err);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


export const getOrderDetailsAdmin = async (req, res) => {
  try {
    const { order_id } = req.params;

    const orderRes = await pool.query(
      `SELECT 
        id, 
        order_number, 
        customer_id, 
        grand_total, 
        total_amount,
        tax,
        delivery_charge,
        status, 
        created_at, 
        address, 
        payment_method
       FROM orders
       WHERE id = $1`,
      [order_id]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "Order not found"
      });
    }

    const itemsRes = await pool.query(
      `SELECT
        oi.product_id,
        p.name,
        oi.quantity,
        oi.price,
        oi.total
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [order_id]
    );

    const order = orderRes.rows[0];
    const items = itemsRes.rows;

    return res.json({
      status: 1,
      message: "Order details fetched (Admin)",
      order,
      items,
      summary: {
        subtotal: Number(order.total_amount || 0),
        tax: Number(order.tax || 0),
        deliveryCharge: Number(order.delivery_charge || 0),
        grandTotal: Number(order.grand_total || 0)
      }
    });

  } catch (err) {
    console.log("Admin Order Details Error:", err);

    return res.status(500).json({
      status: 0,
      message: "Server error"
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  const accessToken = req.headers.accesstoken;
  const { order_id, status } = req.body;

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!order_id || !status) {
    return res.status(400).json({ message: "order_id & status required" });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    const shopId = decoded.shop_id;

    const orderCheck = await pool.query(
      `SELECT id, status FROM orders WHERE id=$1 AND shop_id=$2`,
      [order_id, shopId]
    );

    if (!orderCheck.rows.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = orderCheck.rows[0].status;

    const validTransitions = {
      CREATED: ["ACCEPTED", "CANCELLED"],
      ACCEPTED: ["PREPARING"],
      PREPARING: ["READY"],
      READY: ["PICKED"],
      PICKED: ["COMPLETED"],
    };

    if (
      validTransitions[currentStatus] &&
      !validTransitions[currentStatus].includes(status)
    ) {
      return res.status(400).json({
        message: `Invalid transition ${currentStatus} → ${status}`,
      });
    }

    await pool.query(
      `UPDATE orders SET status=$1 WHERE id=$2`,
      [status, order_id]
    );

    res.json({
      message: "Order status updated",
      order_id,
      status,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};