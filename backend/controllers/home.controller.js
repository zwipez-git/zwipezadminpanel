import pool from "../db/db.js";

export const getHomeData = async (req, res) => {
  try {
    const banners = await pool.query(
      "SELECT id, title, image_url AS image FROM banners ORDER BY id DESC"
    );

    const categories = await pool.query(
      "SELECT id, name, image_url AS image FROM categories ORDER BY id"
    );

    const megaOffers = await pool.query(
         "SELECT * FROM mega_offers ORDER BY id"
    );

    res.json({
      banners: banners.rows,
      categories: categories.rows,
      megaOffers: megaOffers.rows,
    });
  } catch (err) {
    console.error("HOME API ERROR:", err);
    res.status(500).json({ error: "Failed to load home data" });
  }
};
