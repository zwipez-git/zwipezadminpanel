import pool from "../db/db.js";

//add products
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      category_id,
      original_price,
      price,
      country,
      unit,
      description,
      image_url,
      is_active = true, 
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO products
      (name, category_id, original_price, price, country, unit, description, image_url, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        name,
        category_id,
        original_price,
        price,
        country,
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

//get products
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
        p.country,
        p.unit,
        p.description,
        p.image_url,
        p.is_active,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

//update
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  const {
    name,
    category_id,
    original_price,
    price,
    country,
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
        country = $5,
        unit = $6,
        description = $7,
        image_url = $8,
        is_active = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        name,
        category_id,
        original_price,
        price,
        country,
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
