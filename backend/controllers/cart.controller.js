import pool from '../db/db.js';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret";


//add to cart

export const addCart = async (req, res) => {
  const accessToken = req.headers.accesstoken;
  const customerId = req.headers.id;

 const { productId, quantity, isMegaOffer = false } = req.body;


  if (!accessToken || !customerId) {
    return res.status(401).json({ message: "Access token and customerId required" });
  }

  if (!productId || !quantity) {
    return res.status(400).json({ message: "ProductId and quantity required" });
  }

  try {
   
    const decoded = jwt.verify(accessToken, JWT_SECRET);

    if (decoded.customerId != customerId) {
      return res.status(401).json({ message: "Customer ID mismatch" });
    }

    let product;
    let original_price;
    let price;

    //  Check Mega Offer or Normal Product
    if (isMegaOffer) {
      const offerRes = await pool.query(
        `SELECT id, category_id, price, offer_price, unit
         FROM mega_offers
         WHERE id = $1`,
        [productId]
      );

      if (!offerRes.rows.length) {
        return res.status(404).json({ message: "Mega offer not found" });
      }

      product = offerRes.rows[0];

      original_price = product.price;       
      price = product.offer_price;          

    } else {
      const productRes = await pool.query(
        `SELECT id, category_id, original_price, price, unit
         FROM products
         WHERE id = $1`,
        [productId]
      );

      if (!productRes.rows.length) {
        return res.status(404).json({ message: "Product not found" });
      }

      product = productRes.rows[0];

      original_price = product.original_price;
      price = product.price;
    }

 
    let cartRes = await pool.query(
      `SELECT id FROM carts
       WHERE customer_id = $1 AND status = 'ACTIVE'`,
      [customerId]
    );

    let cartId;

    if (!cartRes.rows.length) {
      const newCart = await pool.query(
        `INSERT INTO carts (customer_id, status, created_at)
         VALUES ($1, 'ACTIVE', NOW())
         RETURNING id`,
        [customerId]
      );

      cartId = newCart.rows[0].id;
    } else {
      cartId = cartRes.rows[0].id;
    }

   
    const itemRes = await pool.query(
      `SELECT quantity FROM cart_items
       WHERE cart_id = $1 AND product_id = $2 AND is_mega_offer = $3`,
      [cartId, productId, isMegaOffer]
    );

    let finalQty = Number(quantity);

    if (itemRes.rows.length > 0) {
      finalQty += Number(itemRes.rows[0].quantity);
    }

    const total = finalQty * price;


    if (itemRes.rows.length > 0) {
      await pool.query(
        `UPDATE cart_items
         SET quantity = $1,
             price = $2,
             original_price = $3,
             total = $4
         WHERE cart_id = $5
         AND product_id = $6
         AND is_mega_offer = $7`,
        [finalQty, price, original_price, total, cartId, productId, isMegaOffer]
      );
    } else {
      await pool.query(
        `INSERT INTO cart_items
         (cart_id, product_id, category_id, unit, original_price, price, quantity, total, is_mega_offer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          cartId,
          product.id,
          product.category_id,
          product.unit,
          original_price,
          price,
          quantity,
          quantity * price,
          isMegaOffer
        ]
      );
    }

    return res.json({
      message: "Product added to cart successfully",
      data: {
        productId,
        isMegaOffer,
        quantity: finalQty,
        price,
        original_price,
        total
      }
    });

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Add to cart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//get cart
export const getCart = async (req, res) => {

  const accessToken = req.headers.accesstoken;
  const customerId = req.headers.id;

  if (!accessToken || !customerId) {
    return res.status(401).json({ message: "Access token and customerId required" });
  }

  try {
   
    const decoded = jwt.verify(accessToken, JWT_SECRET);

    if (decoded.customerId != customerId) {
      return res.status(401).json({ message: "Customer ID mismatch" });
    }

      const cartRes = await pool.query(
      `SELECT id FROM carts
       WHERE customer_id = $1 AND status = 'ACTIVE'`,
      [customerId]
    );

    if (cartRes.rows.length === 0) {
      return res.json({
        customerId,
        items: [],
        totalAmount: 0,
        tax: 0,
        deliveryCharge: 0
      });
    }

    const cartId = cartRes.rows[0].id;

   
    const itemsRes = await pool.query(
      `SELECT
        ci.id AS cart_item_id,
        ci.product_id,
        ci.is_mega_offer,

       
        COALESCE(p.name, mo.name) AS product_name,
        COALESCE(p.image_url, mo.image_url) AS product_image,

        c.id AS category_id,
        c.name AS category_name,

        ci.unit,
        ci.original_price,
        ci.price,
        ci.quantity,
        ci.total

       FROM cart_items ci

       LEFT JOIN products p 
         ON p.id = ci.product_id AND ci.is_mega_offer = false

       LEFT JOIN mega_offers mo 
         ON mo.id = ci.product_id AND ci.is_mega_offer = true

       LEFT JOIN categories c 
         ON c.id = ci.category_id

       WHERE ci.cart_id = $1`,
      [cartId]
    );

 
    const totalAmount = itemsRes.rows.reduce(
      (sum, item) => sum + Number(item.total),
      0
    );

    const tax = Math.round(totalAmount * 0.18 * 100) / 100;

    const deliveryCharge =
      totalAmount === 0 ? 0 : (totalAmount >= 400 ? 0 : 40);

      const totalwithTax=totalAmount+tax+deliveryCharge;

    return res.json({
      customerId,
      items: itemsRes.rows,
      totalAmount,
      tax,
      deliveryCharge,
      totalwithTax
    });

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    console.error("Get cart error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


//remove cart item
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