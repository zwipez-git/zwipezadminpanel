import pool from '../db/db.js';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret";

export const addToCart = async (req, res) => {

  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  const { productId, quantity } = req.body;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Access token and customerId required" });
  }

  if (!productId || !quantity) {
    return res.status(400).json({ message: "ProductId and quantity required" });
  }

  try {

    // Verify token
    const decoded = jwt.verify(accessToken, JWT_SECRET);

 
   if (decoded.customerId != id) {
      return res.status(401).json({ message: "Customer ID mismatch" });
    }

    // Check product exists
    const productRes = await pool.query(
      `SELECT id, category_id, price, unit
       FROM products
       WHERE id = $1`,
      [productId]
    );

    if (!productRes.rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRes.rows[0];

    //  Get or create ACTIVE cart
    let cartRes = await pool.query(
      `SELECT id FROM carts
       WHERE customer_id = $1 AND status = 'ACTIVE'`,
      [id]
    );

    let cartId;

    if (!cartRes.rows.length) {
      const newCart = await pool.query(
        `INSERT INTO carts (customer_id, status, created_at)
         VALUES ($1, 'ACTIVE', NOW())
         RETURNING id`,
        [id]
      );

      cartId = newCart.rows[0].id;
    } else {
      cartId = cartRes.rows[0].id;
    }

    // Check if product already in cart
    const itemRes = await pool.query(
      `SELECT quantity FROM cart_items
       WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    let finalQty = Number(quantity);

    if (itemRes.rows.length > 0) {
      finalQty += Number(itemRes.rows[0].quantity);
    }

    const total = finalQty * product.price;

    //  Update or Insert
    if (itemRes.rows.length > 0) {
      await pool.query(
        `UPDATE cart_items
         SET quantity = $1, total = $2
         WHERE cart_id = $3 AND product_id = $4`,
        [finalQty, total, cartId, productId]
      );
    } else {
      await pool.query(
        `INSERT INTO cart_items
         (cart_id, product_id, category_id, unit, price, quantity, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          cartId,
          product.id,
          product.category_id,
          product.unit,
          // product.country,
          product.price,
          quantity,
          quantity * product.price
        ]
      );
    }

    res.json({ message: "Product added to cart successfully" });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getCart = async (req, res) => {

  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Access token and customerId required" });
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

    if (cartRes.rows.length === 0) {
      return res.json({
        id,
        items: [],
        totalAmount: 0
      });
    }

    const cartId = cartRes.rows[0].id;
//  ci.country,
    const itemsRes = await pool.query(
      `SELECT
        ci.id AS cart_item_id,
        p.id AS product_id,
        p.name AS product_name,
        p.image_url AS product_image,
        c.id AS category_id,
        c.name AS category_name,
        ci.unit,
       
        ci.price,
        ci.quantity,
        ci.total
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN categories c ON c.id = ci.category_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const totalAmount = itemsRes.rows.reduce(
      (sum, item) => sum + Number(item.total),0
    );
const tax = Math.round(totalAmount * 0.18 * 100) / 100;
    const Totalwithtax=totalAmount+tax;
   const deliveryCharge = totalAmount === 0 ? 0 : (totalAmount >= 400 ? 0 : 40);

    res.json({
      id,
      items: itemsRes.rows,
      totalAmount,
      tax,
      Totalwithtax,
      deliveryCharge


    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const removeItem = async (req, res) => {

  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  const { cart_item_id ,quantity} = req.body;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!cart_item_id ) {
    return res.status(400).json({ message: " Cart Item Id required" });
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

    await pool.query(
      `DELETE FROM cart_items
       WHERE id = $1 AND cart_id = $2`,
      [cart_item_id , cartId]
    );

    res.json({ message: "Item removed from cart" });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Remove item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Access token and customerId required" });
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
      return res.status(404).json({ message: "Active cart not found" });
    }

    const cartId = cartRes.rows[0].id;

 
    await pool.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cartId]
    );

    res.json({ message: "Cart cleared successfully" });

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



//reduce 1 item

export const decreaseItemQuantity = async (req, res) => {

  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  const { cart_item_id } = req.body;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!cart_item_id) {
    return res.status(400).json({ message: "Cart Item Id required" });
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

    // get quantity and price
    const itemRes = await pool.query(
      `SELECT quantity, price FROM cart_items
       WHERE id = $1 AND cart_id = $2`,
      [cart_item_id, cartId]
    );

    if (!itemRes.rows.length) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const currentQty = itemRes.rows[0].quantity;
    const price = itemRes.rows[0].price;

  
    if (currentQty === 1) {

      await pool.query(
        `DELETE FROM cart_items
         WHERE id = $1 AND cart_id = $2`,
        [cart_item_id, cartId]
      );

      return res.json({ message: "Item removed from cart" });
    }

    // decrease quantity
    const newQty = currentQty - 1;
    const newTotal = newQty * price;

    await pool.query(
      `UPDATE cart_items
       SET quantity = $1, total = $2
       WHERE id = $3 AND cart_id = $4`,
      [newQty, newTotal, cart_item_id, cartId]
    );

    res.json({
      message: "Quantity decreased",
      quantity: newQty,
      total: newTotal
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Decrease item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//increase
export const increaseItemQuantity = async (req, res) => {

  const accessToken = req.headers.accesstoken;
  const id = req.headers.id;

  const { cart_item_id } = req.body;

  if (!accessToken || !id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!cart_item_id) {
    return res.status(400).json({ message: "Cart Item Id required" });
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

    // get current quantity and price
    const itemRes = await pool.query(
      `SELECT quantity, price FROM cart_items
       WHERE id = $1 AND cart_id = $2`,
      [cart_item_id, cartId]
    );

    if (!itemRes.rows.length) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const currentQty = itemRes.rows[0].quantity;
    const price = itemRes.rows[0].price;

    const newQty = currentQty + 1;
    const newTotal = newQty * price;

    await pool.query(
      `UPDATE cart_items
       SET quantity = $1, total = $2
       WHERE id = $3 AND cart_id = $4`,
      [newQty, newTotal, cart_item_id, cartId]
    );

    res.json({
      message: "Quantity increased",
      quantity: newQty,
      total: newTotal
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Increase item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};