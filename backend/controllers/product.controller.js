import pool from "../db/db.js";

//add products
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      category_id,
      original_price,
      price,
      shop_id,
      // country,
      unit,
      description,
      image_url,
      is_active = true, 
    } = req.body;
// country,
    const result = await pool.query(
      `
      INSERT INTO products
      (name, category_id,, original_price, price,shop_id,  unit, description, image_url, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        name,
        category_id,
        original_price,
        price,
        shop_id,
        // country,
        unit,
        description,
        image_url,
        is_active,
      ]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
};

//get products  // p.country,
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.category_id,
        c.name AS category_name,
        p.original_price,
        p.price,
        p.shop_id,
        p.unit,
        p.description,
        p.image_url,
        p.is_active,
        p.created_at
      FROM products p
     
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


// get products by category     p.country,
export const getProductsByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.category_id,
        c.name AS category_name,
        p.original_price,
        p.price,
        p.shop_id,
        p.unit,
        p.description,
        p.image_url,
        p.is_active,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1
      ORDER BY p.id ASC
      `,
      [id]
    );

    res.status(200).json(result.rows);

  } catch (err) {
    console.error("Get products by category error:", err);
    res.status(500).json({ error: "Failed to fetch products by category" });
  }
};

//update   country = $5,
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    category_id,
    shop_id,
    original_price,
    price,
    // country,
    unit,
    description,
    image_url,
    is_active,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        category_id = $2,
        original_price = $3,
        price = $4,
        shop_id=$10
        unit = $5,
        description = $6,
        image_url = $7,
        is_active = $8
      WHERE id = $9
      RETURNING *
      `,
      [
        name,
        category_id,
        original_price,
        price,
        shop_id,
        // country,
        unit,
        description,
        image_url,
        is_active,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

//delete
export const deleteProduct = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
