import pool from "../db/db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateUser = (req, res, next) => {
  const token = req.headers.accesstoken;

  if (!token) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

//user profile(create,update,fetch)

export const UserProfile = async (req, res) => {
  try {
    const customerId = req.headers.id;

    if (!customerId) {
      return res.status(400).json({ status: 0, message: "id header required" });
    }

    const body = req.body || {};
    const address = body.address || {};
    const isBodyEmpty = Object.keys(body).length === 0;

   
    const exists = await pool.query(
      `SELECT 
        id, name, email, phone_number, gender, dob::date AS dob,
        city, state, country, pincode, created_at
       FROM customers WHERE id = $1`,
      [customerId]
    );

 
    //fetch

    if (isBodyEmpty && exists.rows.length) {
      return res.json({
        status: 1,
        message: "Customer profile fetched successfully",
        data: formatUser(exists.rows[0]),
      });
    }

   //insert
    if (!exists.rows.length) {
      await pool.query(
        `INSERT INTO customers
        (id, name, email, phone_number, gender, dob, city, state, country, pincode)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          customerId,
          body.name || null,
          body.email || null,
          body.phone || null,
          body.gender || null,
          body.dob || null,
          address.city || null,
          address.state || null,
          address.country || null,
          address.pincode || null,
        ]
      );
    }


//upadte


    if (!isBodyEmpty) {
      const updates = {
        name: body.name,
        email: body.email,
        phone_number: body.phone,
        gender: body.gender,
        dob: body.dob,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.pincode,
      };

      Object.keys(updates).forEach(
        key =>
          (updates[key] === undefined || updates[key] === "") &&
          delete updates[key]
      );

      if (Object.keys(updates).length) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        const setQuery = fields
          .map((f, i) => `${f} = $${i + 1}`)
          .join(", ");

        await pool.query(
          `UPDATE customers SET ${setQuery} WHERE id = $${fields.length + 1}`,
          [...values, customerId]
        );
      }
    }

  
    const result = await pool.query(
      `SELECT 
        id, name, email, phone_number, gender, dob::date AS dob,
        city, state, country, pincode, created_at
       FROM customers WHERE id = $1`,
      [customerId]
    );

    return res.json({
      status: 1,
      message: "Customer profile fetched successfully",
      data: formatUser(result.rows[0]),
    });

  } catch (err) {
    console.error("UserProfile error:", err);
    return res.status(500).json({ status: 0, message: "Profile failed" });
  }
};
//get users list
export const getUsersList= async (req, res) => {
  try {
    const customerId = req.headers.id;

    
    if (!customerId) {
      const result = await pool.query(`
        SELECT
          id, name, email, phone_number, gender, dob::date AS dob,
          city, state, country, pincode, created_at
        FROM customers
      `);

      return res.json({
        status: 1,
        message: "All customers fetched successfully",
        data: result.rows.map(formatUser)
      });
    }

    
    const result = await pool.query(
      `
      SELECT
        id, name, email, phone_number, gender, dob::date AS dob,
        city, state, country, pincode, created_at
      FROM customers
      WHERE id = $1
      `,
      [customerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 0,
        message: "Customer not found"
      });
    }

    return res.json({
      status: 1,
      message: "Customer profile fetched successfully",
      data: formatUser(result.rows[0])
    });

  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ status: 0, message: "Failed to fetch profile" });
  }
};

//update
export const updateCustomer = async (req, res) => {
  try {
    const { phone } = req.params;
    const { name, email, gender, dob, address = {} } = req.body;

    const updates = {
      name,
      email,
      gender,
      dob,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode
    };

    Object.keys(updates).forEach(
      key => (updates[key] == null || updates[key] === "") && delete updates[key]
    );

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setQuery = fields
      .map((f, i) => `${f} = $${i + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE customers
       SET ${setQuery}
       WHERE phone_number = $${fields.length + 1}
       RETURNING *`,
      [...values, phone]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(formatUser(result.rows[0]));
  } catch (err) {
    console.error("updateCustomer error:", err);
    res.status(500).json({ message: "Failed to update customer" });
  }
};

//delete
export const deleteCustomer = async (req, res) => {
  try {
    const { phone } = req.params;

    const result = await pool.query(
      "DELETE FROM customers WHERE phone_number = $1 RETURNING phone_number",
      [phone]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("deleteCustomer error:", err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

const formatUser = (user) => ({
  id: user.id,
  name: user.name || "",
  email: user.email || "",
  phone: user.phone_number || "",
  gender: user.gender || "",
  dob: user.dob || "",
  address: {
    city: user.city || "",
    state: user.state || "",
    country: user.country || "",
    pincode: user.pincode || ""
  },
  created_at: user.created_at
});
