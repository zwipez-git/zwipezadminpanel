import pool from "../db/db.js";
export const addOfferProduct = async (req, res) => {
  try {
    const {
      name,
      category_id,
      price,
      offer_price,
      country,
      unit,
      description,
      image_url,
    } = req.body;

    await pool.query(
      `
      INSERT INTO mega_offers
      (name, category_id, price, offer_price, country, unit, description, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [name, category_id, price, offer_price, country, unit, description, image_url]
    );

    res.json({ message: "Offer product added successfully" });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Failed to add offer product" });
  }
};
export const getMegaOffers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        off.id,
        off.name,
        off.category_id,
        c.name AS category_name,
        off.price,
        off.offer_price,
        off.country,
        off.unit,
        off.description,
        off.image_url
      FROM mega_offers off
      JOIN categories c ON off.category_id = c.id
      ORDER BY off.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Get offer products error:", err);
    res.status(500).json({ error: "Failed to fetch offer products" });
  }
};
export const updateOfferProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category_id,
    price,
    offer_price,
    country,
    unit,
    description,
    image_url,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE mega_offers
      SET
        name = $1,
        category_id = $2,
        price = $3,
        offer_price = $4,
        country = $5,
        unit = $6,
        description = $7,
        image_url = $8
      WHERE id = $9
      RETURNING *
      `,
      [name, category_id, price, offer_price, country, unit, description, image_url, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Offer product not found" });
    }

    res.json({
      message: "Offer product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Update offer product error:", err);
    res.status(500).json({ error: "Failed to update offer product" });
  }
};
export const deleteOfferProduct = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM mega_offers WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Offer product not found" });
    }

    res.json({ message: "Offer product deleted successfully" });
  } catch (err) {
    console.error("Delete offer product error:", err);
    res.status(500).json({ error: "Failed to delete offer product" });
  }
};
