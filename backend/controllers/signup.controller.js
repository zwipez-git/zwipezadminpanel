import bcrypt from "bcrypt";
import pool from "../db/db.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1,$2,$3)
     RETURNING id,name,email,role`,
    [name, email, hashedPassword]
  );

  res.status(201).json({ user: result.rows[0] });
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


