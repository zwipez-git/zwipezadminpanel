import pool from "../db/db.js";

export const addOfferProduct = async (req, res) => {
  try {
    const {
      name,
      category_id,
      price,
      offer_price,
      // country,
      unit,
      description,
      image_url,
    } = req.body;
// country,
    await pool.query(
      `INSERT INTO mega_offers
      (name, category_id, price, offer_price,  unit, description, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name, category_id, price, offer_price, unit, description, image_url]
    );

    res.json({ message: "Offer product added successfully" });
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Failed to add offer product" });
  }
};

//  off.country,
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

  const id = Number(req.params.id);

  const {
    name,
    category_id,
    price,
    offer_price,
    // country,
    unit,
    description,
    image_url,
  } = req.body;

  try {
//  country=$5
    const result = await pool.query(
      `UPDATE mega_offers
       SET name=$1,
           category_id=$2,
           price=$3,
           offer_price=$4,
          
           unit=$5,
           description=$6,
           image_url=$7
       WHERE id=$8
       RETURNING *`,
      [name, category_id, price, offer_price, unit, description, image_url, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Offer product not found" });
    }
 // off.country,
    const updated = await pool.query(`
      SELECT
        off.id,
        off.name,
        off.category_id,
        c.name AS category_name,
        off.price,
        off.offer_price,
       
        off.unit,
        off.description,
        off.image_url
      FROM mega_offers off
      JOIN categories c ON off.category_id = c.id
      WHERE off.id=$1
    `,[id]);

    res.json(updated.rows[0]);

  } catch (err) {
    console.error("Update offer product error:", err);
    res.status(500).json({ error: "Failed to update offer product" });
  }
};

export const deleteOfferProduct = async (req, res) => {

  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {

    const result = await pool.query(
      "DELETE FROM mega_offers WHERE id=$1 RETURNING *",
      [id]
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