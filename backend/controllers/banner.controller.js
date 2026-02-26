import pool from "../db/db.js";

export const addBannerImage = async (req, res) => {
  try {
   

    const { title, image_url } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: "Missing title or image_url" });
    }

    const query = `
      INSERT INTO banners (title, image_url)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const values = [title, image_url];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Banner added successfully",
      banner: result.rows[0],
    });
  } catch (error) {
    console.error("ADD BANNER ERROR:", error);
    res.status(500).json({ error: "Failed to add banner image" });
  }
};

//get all banner images
export const getBannerImages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM banners ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET BANNER ERROR:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

//update

export const updateBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image_url } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: "Missing title or image_url" });
    }

    const result = await pool.query(
      `UPDATE banners 
       SET title = $1, image_url = $2 
       WHERE id = $3 
       RETURNING *`,
      [title, image_url, id]
    );

    res.json({ banner: result.rows[0] });
  } catch (err) {
    console.error("UPDATE BANNER ERROR:", err);
    res.status(500).json({ error: "Failed to update banner" });
  }
};

//delete

export const deleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM banners WHERE id = $1", [id]);

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("DELETE BANNER ERROR:", err);
    res.status(500).json({ error: "Failed to delete banner" });
  }
};

