
import pool from "../db/db.js";
export const addAddress = async (req, res) => {
  try {
    const customerId = req.user.customerId;

    // ✅ validation first
    if (!req.body) {
      return res.status(400).json({
        status: 0,
        message: "Request body required"
      });
    }

    const {
      type,
      address_line,
      city,
      state,
      country,
      pincode,
      is_default
    } = req.body;

    // ✅ check duplicate BEFORE insert
    const existing = await pool.query(
      `SELECT id FROM customer_addresses 
       WHERE customer_id = $1 
       AND address_line = $2 
       AND city = $3 
       AND state = $4 
       AND country = $5 
       AND pincode = $6`,
      [customerId, address_line, city, state, country, pincode]
    );

    if (existing.rows.length) {
      return res.status(400).json({
        status: 0,
        message: "Address already exists"
      });
    }

    // ✅ default logic
    if (is_default) {
      await pool.query(
        `UPDATE customer_addresses SET is_default = false WHERE customer_id = $1`,
        [customerId]
      );
    }

    // ✅ insert
    const result = await pool.query(
      `INSERT INTO customer_addresses
       (customer_id, type, address_line, city, state, country, pincode, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [customerId, type, address_line, city, state, country, pincode, is_default || false]
    );

    return res.json({
      status: 1,
      message: "Address added",
      data: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: "Failed to add address" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const result = await pool.query(
      `SELECT * FROM customer_addresses WHERE customer_id = $1 ORDER BY id DESC`,
      [customerId]
    );

    res.json({
      status: 1,
      data: result.rows
    });

  } catch (err) {
    res.status(500).json({ status: 0 });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { address_id, ...updates } = req.body;

    if (!address_id) {
      return res.status(400).json({
        status: 0,
        message: "address_id required"
      });
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (!fields.length) {
      return res.status(400).json({
        status: 0,
        message: "No fields to update"
      });
    }

    const setQuery = fields
      .map((f, i) => `${f} = $${i + 1}`)
      .join(", ");

    const result = await pool.query(
      `UPDATE customer_addresses
       SET ${setQuery}
       WHERE id = $${fields.length + 1}
       AND customer_id = $${fields.length + 2}
       RETURNING *`,
      [...values, address_id, customerId]
    );

    res.json({
      status: 1,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ status: 0 });
  }
};
export const deleteAddress = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { address_id } = req.body;

    if (!address_id) {
      return res.status(400).json({
        status: 0,
        message: "address_id required"
      });
    }

    const result = await pool.query(
      `DELETE FROM customer_addresses 
       WHERE id = $1 AND customer_id = $2
       RETURNING *`,
      [address_id, customerId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        status: 0,
        message: "Address not found or not yours"
      });
    }

    res.json({
      status: 1,
      message: "Address deleted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0 });
  }
};