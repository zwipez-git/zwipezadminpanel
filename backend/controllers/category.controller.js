import pool from "../db/db.js";

export const addCategory = async (req, res) => {
  const { name, image_url } = req.body;

  try {
    await pool.query(
      "INSERT INTO categories (name, image_url) VALUES ($1, $2)",
      [name.trim(), image_url]
    );

    res.json({ message: "Category added" });

  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};


export const getCategories = async (req, res) => {
  const result = await pool.query("SELECT * FROM categories");
  res.json(result.rows);
};


export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE categories
       SET name = $1, image_url = $2
       WHERE id = $3
       RETURNING *`,
      [name.trim(), image_url, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category updated",
      category: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Category name already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM products WHERE category_id = $1", [id]);

    // Delete the category by ID
    const result = await client.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );

    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

