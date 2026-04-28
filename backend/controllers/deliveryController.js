import pool from "../db/db.js";

// GET DELIVERY PROFILE
export const getDeliveryProfile = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const result = await pool.query(
      `SELECT * FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    if (!result.rows.length) {
      return res.status(200).json({
        message: "Delivery user not found",
        isNewUser: true
      });
    }

    res.json({
      message: "Delivery profile fetched",
      data: result.rows[0],
      isNewUser: false
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching delivery profile" });
  }
};


//  REGISTER DELIVERY (BASIC INFO)
export const registerDelivery = async (req, res) => {
console.log(" REGISTER HIT");
console.log("BODY:", req.body);
console.log("USER:", req.user);
  try {
    const { phone_number } = req.user;
    const { first_name, last_name } = req.body;

    if (!first_name) {
      return res.status(400).json({ message: "First name required" });
    }

    // check existing
    const existing = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    if (existing.rows.length) {
      return res.json({
        message: "Already registered",
        isNewUser: false,
        data: {
          id: existing.rows[0].id,
          phone_number
        }
      });
      
    }

    // insert
    const result = await pool.query(
      `INSERT INTO delivery_partners 
       (phone_number, first_name, last_name, is_profile_completed, created_at)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING id, phone_number, first_name, last_name`,
      [phone_number, first_name, last_name]
    );

    res.json({
      message: "Delivery registered successfully",
      isNewUser: false,
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
};


//  COMPLETE PROFILE 
export const completeDeliveryProfile = async (req, res) => {
      console.log(" COMPLETE PROFILE HIT");
  try {
    const { phone_number } = req.user;

   const {
  father_name,
  dob,
  whatsapp_number,
  secondary_phone,
  blood_group,
  city,
  address,
  preferred_language
} = req.body;
const result = await pool.query(
  `UPDATE delivery_partners SET
    father_name = $1,
    dob = $2,
    whatsapp_number = $3,
    secondary_phone = $4,
    blood_group = $5,
    city = $6,
    address = $7,
    preferred_language = $8,
    is_profile_completed = true
   WHERE phone_number = $9
   RETURNING *`,
  [
    father_name,
    dob,
    whatsapp_number,
    secondary_phone,
    blood_group,
    city,
    address,
    preferred_language,
    phone_number
  ]
);

    res.json({
      message: "Profile completed successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Profile update failed",
      error: err.message
    });
  }
};

//  AADHAR

export const saveAadhar = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const {
      aadhar_number,
      full_name,
      dob,
      front_image_url,
      back_image_url
    } = req.body;

    const user = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partner_id = user.rows[0].id;

    const result = await pool.query(
      `INSERT INTO partner_aadhar 
      (partner_id, aadhar_number, full_name, dob, front_image_url, back_image_url)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        partner_id,
        aadhar_number,
        full_name,
        dob,
        front_image_url,
        back_image_url
      ]
    );

    res.json({
      message: "Aadhar saved",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save Aadhar" });
  }
};
export const getAadhar = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const partner = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partnerId = partner.rows[0].id;

    const result = await pool.query(
      `SELECT * FROM partner_aadhar WHERE partner_id=$1`,
      [partnerId]
    );

    res.json({
      message: "Aadhar fetched",
      data: result.rows[0] || null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching Aadhar" });
  }
};

//  PAN CARD

export const savePan = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const {
      pan_number,
      name,
      dob,
      image_url
    } = req.body;

    const user = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partner_id = user.rows[0].id;

    const result = await pool.query(
      `INSERT INTO partner_pan 
      (partner_id, pan_number, name, dob, image_url)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        partner_id,
        pan_number,
        name,
        dob,
        image_url
      ]
    );

    res.json({
      message: "PAN saved",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save PAN" });
  }
};
export const getPan = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const partner = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partnerId = partner.rows[0].id;

    const result = await pool.query(
      `SELECT * FROM partner_pan WHERE partner_id=$1`,
      [partnerId]
    );

    res.json({
      message: "PAN fetched",
      data: result.rows[0] || null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching PAN" });
  }
};

//  VEHICLE

export const saveVehicle = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const {
      vehicle_type,        // cycle | bike | ev | none
      vehicle_number,
      brand,
      color,
      rc_number,
      battery_capacity
    } = req.body;

    // 🔹 get partner_id
    const user = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partner_id = user.rows[0].id;

    console.log("🚗 VEHICLE BODY:", req.body);
    console.log("👤 PARTNER ID:", partner_id);

    const result = await pool.query(
      `INSERT INTO partner_vehicle 
      (partner_id, vehicle_type, vehicle_number, brand, color, rc_number, battery_capacity)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (partner_id)
      DO UPDATE SET
        vehicle_type = EXCLUDED.vehicle_type,
        vehicle_number = EXCLUDED.vehicle_number,
        brand = EXCLUDED.brand,
        color = EXCLUDED.color,
        rc_number = EXCLUDED.rc_number,
        battery_capacity = EXCLUDED.battery_capacity
      RETURNING *`,
      [
        partner_id,
        vehicle_type,
        vehicle_number || null,
        brand || null,
        color || null,
        rc_number || null,
        battery_capacity || null
      ]
    );

    res.json({
      message: "Vehicle saved successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Vehicle save failed",
      error: err.message
    });
  }
};

//  DRIVING LICENSE
export const saveLicense = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const {
      license_number,
      full_name,
      blood_group,
      dob,
      expiry_date,
      front_image_url,
      back_image_url
    } = req.body;

    const partner = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partnerId = partner.rows[0].id;

    const result = await pool.query(
      `INSERT INTO partner_license
       (partner_id, license_number, full_name, blood_group, dob, expiry_date, front_image_url, back_image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        partnerId,
        license_number,
        full_name,
        blood_group,
        dob,
        expiry_date,
        front_image_url,
        back_image_url
      ]
    );

    res.json({
      message: "License saved",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("LICENSE ERROR:", err); 
    res.status(500).json({ message: "License save failed" });
  }
};

// BANK

export const saveBankDetails = async (req, res) => {
  try {
    console.log(" SAVE BANK HIT");

    const { phone_number } = req.user;
    console.log("USER PHONE:", phone_number);

    const { name, accountNumber, ifsc, bankName, branch } = req.body;
    console.log(" REQUEST BODY:", req.body);

    if (!name || !accountNumber || !ifsc) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔹 get partner_id
    const user = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    if (!user.rows.length) {
      console.log("❌ No user found for phone:", phone_number);
      return res.status(404).json({ message: "User not found" });
    }

    const partner_id = user.rows[0].id;
    console.log(" PARTNER ID:", partner_id);

    // 🔹 insert / update
    const result = await pool.query(
      `INSERT INTO bank_details 
       (partner_id, name, account_number, ifsc, bank_name, branch) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (partner_id)
       DO UPDATE SET
         name = EXCLUDED.name,
         account_number = EXCLUDED.account_number,
         ifsc = EXCLUDED.ifsc,
         bank_name = EXCLUDED.bank_name,
         branch = EXCLUDED.branch
       RETURNING *`,
      [partner_id, name, accountNumber, ifsc, bankName, branch]
    );

    console.log(" BANK SAVED:", result.rows[0]);

    res.status(200).json({
      message: "Bank details saved",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("❌ BANK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Emergency details
export const saveEmergencyDetails = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const { name, phone, blood_group, medical_notes, address } = req.body;

    const user = await pool.query(
      `SELECT id FROM delivery_partners WHERE phone_number=$1`,
      [phone_number]
    );

    const partner_id = user.rows[0].id;

    const result = await pool.query(
      `INSERT INTO partner_emergency 
      (partner_id, name, phone, blood_group, medical_notes, address)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (partner_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        blood_group = EXCLUDED.blood_group,
        medical_notes = EXCLUDED.medical_notes,
        address = EXCLUDED.address
      RETURNING *`,
      [partner_id, name, phone, blood_group, medical_notes, address]
    );

    res.json({ message: "Emergency saved", data: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save emergency" });
  }
};

//  OPTIONAL: UPDATE PROFILE LATER
export const updateDeliveryProfile = async (req, res) => {
  try {
    const { phone_number } = req.user;

    const { secondary_phone, city, address } = req.body;

    const result = await pool.query(
      `UPDATE delivery_partners SET
        secondary_phone = COALESCE($1, secondary_phone),
        city = COALESCE($2, city),
        address = COALESCE($3, address)
       WHERE phone_number = $4
       RETURNING *`,
      [secondary_phone, city, address, phone_number]
    );

    res.json({
      message: "Profile updated",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};