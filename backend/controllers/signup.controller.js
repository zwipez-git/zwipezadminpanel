import bcrypt from "bcrypt";
import pool from "../db/db.js";

// export const signup = async (req, res) => {
//   try{
//   const { name, email, password, shop_id  } = req.body;
//   console.log("REQ BODY:", req.body); 
//     // Validation
//     if (!name || !email || !password || !shop_id) {
//       return res.status(400).json({ error: "All fields required" });
//     }

//   // Only numbers (no letters, no spaces)
// if (!/^\d+$/.test(shop_id)) {
//   return res.status(400).json({ error: "Shop ID must be a valid number" });
// }

// if (Number(shop_id) <= 0) {
//   return res.status(400).json({ error: "Shop ID must be greater than 0" });
// }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const result = await pool.query(
//     `INSERT INTO users (name, email, password, shop_id)
//      VALUES ($1,$2,$3,$4)
//      RETURNING id,name,email,role`,
//     [name, email, hashedPassword, shop_id]
//   );

//   res.status(201).json({ user: result.rows[0] });
// } catch (err) {
//     console.error("SIGNUP ERROR:", err); // 🔥 NOW YOU WILL SEE ERROR
//     res.status(500).json({ error: err.message });
//   }
// };
export const signup = async (req, res) => {
  try {
    console.log("SIGNUP HIT"); // 🔥

    const { name, email, password, shop_id } = req.body;
    console.log("REQ BODY:", req.body); // 🔥

    if (!name || !email || !password || !shop_id) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (!/^\d+$/.test(shop_id)) {
      return res.status(400).json({ error: "Shop ID must be number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, shop_id)
       VALUES ($1,$2,$3,$4)
       RETURNING id,name,email,role`,
      [name, email, hashedPassword, Number(shop_id)]
    );

    res.status(201).json({ user: result.rows[0] });

  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err.message); // 🔥 CRITICAL
    res.status(500).json({ error: err.message });
  }
};


export const getAdminsList = async (req, res) => {
  const result = await pool.query(
    "SELECT id,name,email,role FROM users"
  );
  res.json(result.rows);
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, role, password } = req.body;

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `UPDATE users SET name=$1, role=$2, password=$3 WHERE id=$4
       RETURNING id,name,email,role`,
      [name, role, hashed, id]
    );
    return res.json({ user: result.rows[0] });
  }

  const result = await pool.query(
    `UPDATE users SET name=$1, role=$2 WHERE id=$3
     RETURNING id,name,email,role`,
    [name, role, id]
  );

  res.json({ user: result.rows[0] });
};

export const deleteUser = async (req, res) => {
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  res.json({ message: "User deleted" });
};


