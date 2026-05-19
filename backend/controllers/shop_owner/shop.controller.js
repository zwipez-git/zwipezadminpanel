// import pool from "../../db/db.js";

// /// 🏪 REGISTER OR UPDATE SHOP
// export const registerShop = async (req, res) => {
//   try {
//     let { shop_name, owner_name, phone_number, address } = req.body;

//     if (!shop_name || !owner_name || !phone_number || !address) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     // ✅ NORMALIZE PHONE
//     const cleanPhone = phone_number.trim();

//     // 🔥 CHECK OTP VERIFIED
//     const otpCheck = await pool.query(
//       `SELECT * FROM otp_store 
//        WHERE phone_number=$1 AND expires_at > NOW()
//        ORDER BY id DESC LIMIT 1`,
//       [cleanPhone]
//     );

//     if (otpCheck.rows.length === 0) {
//       return res.status(400).json({ message: "OTP not verified or expired" });
//     }

//     // 🔥 CHECK IF SHOP EXISTS
//     const existingShop = await pool.query(
//       `SELECT * FROM shops WHERE phone_number=$1`,
//       [cleanPhone]
//     );

//     let result;

//     if (existingShop.rows.length) {
//       // ✅ UPDATE (NO NEW ROW)
//       result = await pool.query(
//         `UPDATE shops
//          SET shop_name=$1, owner_name=$2, address=$3, is_verified=true
//          WHERE phone_number=$4
//          RETURNING *`,
//         [shop_name, owner_name, address, cleanPhone]
//       );
//     } else {
//       // ✅ INSERT (FIRST TIME ONLY)
//       result = await pool.query(
//         `INSERT INTO shops (shop_name, owner_name, phone_number, address, is_verified)
//          VALUES ($1, $2, $3, $4, true)
//          RETURNING *`,
//         [shop_name, owner_name, cleanPhone, address]
//       );
//     }

//     res.json({
//       message: "Shop saved successfully",
//       data: result.rows[0],
//     });

//   } catch (err) {
//     console.error("SHOP REGISTER ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


// /// 📦 GET SHOP BY PHONE
// export const getShop = async (req, res) => {
//   try {
//     const phone = req.params.phone.trim();

//     const result = await pool.query(
//       `SELECT * FROM shops WHERE phone_number=$1`,
//       [phone]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     res.json(result.rows[0]);

//   } catch (err) {
//     console.error("GET SHOP ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


// /// 🧑‍💼 GET SHOP PROFILE (TOKEN BASED)
// export const getMyShop = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (user.role !== "shop_owner") {
//       return res.status(403).json({ message: "Access denied (not shop owner)" });
//     }

//     const result = await pool.query(
//       `SELECT * FROM shops WHERE phone_number=$1`,
//       [user.phone_number]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     res.json(result.rows[0]);

//   } catch (err) {
//     console.error("GET MY SHOP ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


// /// 🗑 DELETE SHOP (SECURE)
// export const deleteShop = async (req, res) => {
//   try {
//     const user = req.user;

//     if (!user || user.role !== "shop_owner") {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const result = await pool.query(
//       `DELETE FROM shops WHERE phone_number=$1 RETURNING *`,
//       [user.phone_number]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "Shop not found" });
//     }

//     res.json({
//       message: "Shop deleted successfully",
//       data: result.rows[0],
//     });

//   } catch (err) {
//     console.error("DELETE SHOP ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

import pool from "../../db/db.js";

/// 🏪 REGISTER OR UPDATE SHOP (WITH IMAGES)
export const registerShop = async (req, res) => {
  try {
    let {
      shop_name,
      owner_name,
      phone_number,
      address,
      shop_image_url,
      certificate_image_url,
      has_certificate,
       opening_time,
  closing_time,
  is_active
    } = req.body;

    if (!shop_name || !owner_name || !phone_number || !address) {
      return res.status(400).json({ message: "All fields required" });
    }

    const cleanPhone = phone_number.trim();

    // ✅ CHECK OTP VERIFIED
    const otpCheck = await pool.query(
      `SELECT * FROM otp_store 
       WHERE phone_number=$1 AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [cleanPhone]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ message: "OTP not verified or expired" });
    }

    // ✅ CHECK EXISTING SHOP
    const existingShop = await pool.query(
      `SELECT * FROM shops WHERE phone_number=$1`,
      [cleanPhone]
    );

    let result;

    if (existingShop.rows.length) {
      // 🔄 UPDATE
      result = await pool.query(
        `UPDATE shops
         SET shop_name=$1,
             owner_name=$2,
             address=$3,
             shop_image_url=$4,
             certificate_image_url=$5,
             has_certificate=$6,
             opening_time=$7,
             closing_time=$8,
             is_active=$9,
             is_verified=true
         WHERE phone_number=$10
         RETURNING *`,
        [
          shop_name,
          owner_name,
          address,
          shop_image_url || null,
          certificate_image_url || null,
          has_certificate ?? false,
          opening_time || null,
    closing_time || null,
    is_active ?? true,
          cleanPhone
        ]
      );
    } else {
      // 🆕 INSERT
     result = await pool.query(
  `INSERT INTO shops 
  (shop_name, owner_name, phone_number, address, shop_image_url, certificate_image_url, has_certificate, opening_time, closing_time, is_active, is_verified)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
   RETURNING *`,
  [
    shop_name,
    owner_name,
    cleanPhone,
    address,
    shop_image_url || null,
    certificate_image_url || null,
    has_certificate ?? false,
    opening_time || null,
    closing_time || null,
    is_active ?? true
  ]
);
    }

    res.json({
      message: "Shop saved successfully",
      data: result.rows[0],
    });

  } catch (err) {
    console.error("SHOP REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
export const isShopOpenNow = (shop) => {
  if (!shop.opening_time || !shop.closing_time) return true;

  const now = new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    now >= shop.opening_time &&
    now <= shop.closing_time
  );
};
export const getShop = async (req, res) => {
  try {
    const phone = req.params.phone.trim();

    const result = await pool.query(
      `SELECT * FROM shops WHERE phone_number=$1`,
      [phone]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("GET SHOP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
  // GET /api/shops/check/:phone
export const checkShopExists = async (req, res) => {
  try {
    const phone = req.params.phone;

    const result = await pool.query(
      `SELECT * FROM shops WHERE phone_number=$1`,
      [phone]
    );

    if (result.rows.length) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getMyShop = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role !== "shop_owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      `SELECT * FROM shops WHERE phone_number=$1`,
      [user.phone_number]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("GET MY SHOP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
export const toggleShopActive = async (req, res) => {
  try {
    const user = req.user;

    const result = await pool.query(
      `UPDATE shops
       SET is_active = NOT is_active
       WHERE phone_number=$1
       RETURNING *`,
      [user.phone_number]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//GET SHOP
export const getAllShops = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT * FROM shops`
    );

    res.status(200).json({
      success: true,
      totalShops: result.rows.length,
      shops: result.rows,
    });

  } catch (error) {

    console.log("Get All Shops Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch shops",
      error: error.message,
    });

  }
};