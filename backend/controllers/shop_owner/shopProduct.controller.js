import pool from "../../db/db.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
/// ➕ ADD OR UPDATE PRODUCT (UPSERT)
// export const addOrUpdateProduct = async (req, res) => {
//   try {
//     console.log("BODY:", req.body);
//     console.log("FILE:", req.file);
//     console.log("USER:", req.user);

//     const phone = req.user.phone_number;

//     const shopResult = await pool.query(
//       "SELECT shop_id FROM shops WHERE phone_number = $1",
//       [phone]
//     );

//     if (shopResult.rows.length === 0) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     const shopId = shopResult.rows[0].shop_id;

//     // ✅ FIX: safe destructuring
//     const { name, price, stock, category, unit } = req.body || {};

//     // ❗ IMAGE REQUIRED
//     if (!req.file) {
//       return res.status(400).json({ message: "Image required" });
//     }

//     // 🔥 Upload to Cloudinary
//   const streamUpload = (fileBuffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.v2.uploader.upload_stream(
//       {
//         folder: "fruvvy_images/products", // ✅ your folder
//       },
//       (error, result) => {
//         if (result) resolve(result);
//         else reject(error);
//       }
//     );

//     stream.end(fileBuffer);
//   });
// };

// const resultCloud = await streamUpload(req.file.buffer);
// const imageUrl = resultCloud.secure_url;
//     const query = `
//       INSERT INTO shop_products (shop_id, name, price, stock, category, image, unit)
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       ON CONFLICT (shop_id, name)
//       DO UPDATE SET
//         price = EXCLUDED.price,
//         stock = EXCLUDED.stock,
//         category = EXCLUDED.category,
//         image = EXCLUDED.image,
//         unit = EXCLUDED.unit
//       RETURNING *;
//     `;

//     const result = await pool.query(query, [
//       shopId,
//       name,
//       price,
//       stock,
//       category,
//       imageUrl, // ✅ USE CLOUDINARY URL
//       unit,
//     ]);

//     res.json(result.rows[0]);

//   } catch (err) {
//   console.error("🔥 REAL ERROR:", err);
//   res.status(500).json({ 
//     message: "Server error", 
//     error: err.message 
//   });
// }
// };

export const addOrUpdateProduct = async (req, res) => {
  try {
  const phone = req.user.phone_number;

const shopResult = await pool.query(
  "SELECT shop_id FROM shops WHERE phone_number = $1",
  [phone]
);

if (shopResult.rows.length === 0) {
  return res.status(404).json({ message: "Shop not found" });
}

const shopId = shopResult.rows[0].shop_id;
    // ✅ NEW DATA
    const { product_id, price, stock } = req.body;

    if (!product_id || !price || !stock) {
      return res.status(400).json({
        message: "product_id, price, stock required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO shop_products (shop_id, product_id, price, stock)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (shop_id, product_id)
      DO UPDATE SET
        price = EXCLUDED.price,
        stock = EXCLUDED.stock
      RETURNING *;
      `,
      [shopId, product_id, price, stock]
    );

    res.json({
      status: 1,
      message: "Product saved",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("🔥 ERROR:", err); // IMPORTANT
    res.status(500).json({
      message: "Error saving product",
    });
  }
};

/// 📦 GET PRODUCTS (ONLY THAT SHOP)

export const getProducts = async (req, res) => {
  try {
    console.log("USER:", req.user);

    const phone = req.user.phone_number;

    const shopResult = await pool.query(
      "SELECT shop_id FROM shops WHERE phone_number = $1",
      [phone]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ message: "Shop not found" });
    }

    const shopId = shopResult.rows[0].shop_id;

    const result = await pool.query(
      `
      SELECT 
        sp.id,
        sp.product_id,
        sp.price,
        sp.stock,

        p.name,
        p.category_id,
        c.name AS category_name,
        p.image_url,
        p.unit

      FROM shop_products sp
      JOIN products p ON p.id = sp.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE sp.shop_id = $1
      `,
      [shopId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/// ❌ DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM shop_products WHERE id = $1", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;

    console.log("UPDATE ID:", id);
    console.log("NEW DATA:", price, stock);

    const result = await pool.query(
      `
      UPDATE shop_products
      SET price = $1, stock = $2
      WHERE id = $3
      RETURNING *
      `,
      [price, stock, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
};
