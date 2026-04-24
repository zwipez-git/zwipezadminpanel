import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../db/db.js";

const ACCESS_TOKEN_EXPIRY = "1d";
const REFRESH_TOKEN_EXPIRY_DAYS = 90;
const JWT_SECRET = process.env.JWT_SECRET || "please-set-a-secret";

const generateOTP = () => crypto.randomInt(1000, 9999).toString();
const generateRefreshTokenPlain = () => crypto.randomBytes(48).toString("hex");
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateAccessToken = (payload) =>
  jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

const refreshTokenExpiryDate = () =>
  new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

/// 🔥 ROLE CHECK
const getUserRole = async (phone_number) => {
  let role = "customer";

  const shop = await pool.query(
    `SELECT 1 FROM shops WHERE phone_number=$1`,
    [phone_number]
  );

  if (shop.rows.length) {
    role = "shop_owner";
  }

  return role;
};

/// 🔐 AUTH MIDDLEWARE
export const authMiddleware = (required = true) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (required) return res.status(401).json({ message: "No token provided" });
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = decoded;
      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

/// 📲 SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number)
      return res.status(400).json({ message: "Phone number required" });

    await pool.query(`DELETE FROM otp_store WHERE phone_number=$1`, [phone_number]);

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_store (phone_number, otp, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [phone_number, otp, expires_at]
    );

    res.json({ message: "OTP sent", otp });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/// ✅ VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp)
      return res.status(400).json({ message: "Phone number & OTP required" });

    const otpResult = await pool.query(
      `SELECT * FROM otp_store
       WHERE phone_number=$1 AND otp=$2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone_number, otp]
    );

    if (!otpResult.rows.length) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 🔥 ROLE
    const { app_type } = req.body;

let role;

// 🎯 PRIORITY: frontend choice
if (app_type === "shop") {
  role = "shop_owner";
} else if (app_type === "user") {
  role = "customer";
} else {
  // fallback (auto detect)
  role = await getUserRole(phone_number);
}

    // 👤 CUSTOMER CREATE
   let customerId = null;

// ==========================
// 👤 CUSTOMER FLOW
// ==========================
if (role === "customer") {
  const customer = await pool.query(
    `SELECT id FROM customers WHERE phone_number=$1`,
    [phone_number]
  );

  if (customer.rows.length) {
    customerId = customer.rows[0].id;
  } else {
    const insert = await pool.query(
      `INSERT INTO customers (phone_number, created_at)
       VALUES ($1, NOW()) RETURNING id`,
      [phone_number]
    );
    customerId = insert.rows[0].id;
  }
}

// ==========================
// 🏪 SHOP OWNER FLOW
// ==========================
let shopId = null;

if (role === "shop_owner") {
  const shop = await pool.query(
    `SELECT shop_id FROM shops WHERE phone_number=$1`,
    [phone_number]
  );

  if (shop.rows.length) {
    // ✅ already exists
    // shopId = shop.rows[0].id;
    shopId = shop.rows[0].shop_id; 
  } else {
    // ✅ create new shop (like customer logic)
    const insert = await pool.query(
  `INSERT INTO shops (phone_number, is_verified, created_at)
   VALUES ($1, true, NOW()) RETURNING shop_id`,
  [phone_number]
);

shopId = insert.rows[0].shop_id;
  }

  // ✅ mark verified (safe even if already true)
  await pool.query(
    `UPDATE shops SET is_verified=true WHERE phone_number=$1`,
    [phone_number]
  );
}

    // 🔐 TOKENS
    const accessToken = generateAccessToken({
      phone_number,
      role,
      customerId,
      shopId,
    });

    const plainRefreshToken = generateRefreshTokenPlain();
    const refreshTokenHash = hashToken(plainRefreshToken);
    const refreshExpiresAt = refreshTokenExpiryDate();

    // ✅ DELETE ONLY SAME ROLE
    await pool.query(
      `DELETE FROM refresh_tokens WHERE phone_number=$1 AND role=$2`,
      [phone_number, role]
    );

    // ✅ INSERT ROLE BASED
    await pool.query(
      `INSERT INTO refresh_tokens
       (phone_number, token_hash, role, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [phone_number, refreshTokenHash, role, refreshExpiresAt]
    );

    res.json({
      phone_number,
      role,
      accessToken,
      customerId,
  shopId, 
      refreshToken: plainRefreshToken,
      message: "Login successful",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/// 🔄 REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const hash = hashToken(refreshToken);

    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash=$1`,
      [hash]
    );

    if (!result.rows.length)
      return res.status(401).json({ message: "Invalid refresh token" });

    const tokenData = result.rows[0];

    const newAccessToken = generateAccessToken({
      phone_number: tokenData.phone_number,
      role: tokenData.role,
       customerId: tokenData.customer_id || null,
  shopId: tokenData.shop_id || null,
    });

    res.json({
      accessToken: newAccessToken,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Refresh failed" });
  }
};

/// 📋 GET OTP LIST
export const getOtpList = async (req, res) => {
  const result = await pool.query(`SELECT * FROM otp_store`);
  res.json(result.rows);
};

/// 📋 GET ALL TOKENS
export const getAllRefreshTokens = async (req, res) => {
  const result = await pool.query(`SELECT * FROM refresh_tokens`);
  res.json(result.rows);
};