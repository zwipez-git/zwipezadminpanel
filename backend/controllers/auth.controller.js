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


export const authMiddleware = (required = true) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
     console.log("JWT_SECRET:", process.env.JWT_SECRET); 

    if (!authHeader) {
      if (required) return res.status(401).json({ message: "No token provided" });
      req.user = null; 
      return next();
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const now = Math.floor(Date.now() / 1000);
      const expiresInSeconds = decoded.exp - now;

      if (expiresInSeconds <= 0) {
        return res.status(401).json({ message: "Access token expired" });
      }

      req.user = { ...decoded, expiresInSeconds };
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired", expiredAt: err.expiredAt });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
// send otp

export const sendOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ message: "Phone number required" });

    await pool.query(`DELETE FROM otp_store WHERE phone_number=$1`, [phone_number]);

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

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
//verify otp

export const verifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;
    if (!phone_number || !otp)
      return res.status(400).json({ message: "Phone number & OTP required" });

    const otpResult = await pool.query(
      `SELECT * FROM otp_store
       WHERE phone_number=$1 AND otp=$2 AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone_number, otp]
    );

    if (!otpResult.rows.length) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if customer exists
    const customerResult = await pool.query(
      `SELECT id FROM customers WHERE phone_number=$1`,
      [phone_number]
    );

    let customerId;

    if (customerResult.rows.length) {
      customerId = customerResult.rows[0].id;
    } else {
      const insertCustomer = await pool.query(
        `INSERT INTO customers (phone_number, created_at)
         VALUES ($1, NOW())
         RETURNING id`,
        [phone_number]
      );
      customerId = insertCustomer.rows[0].id;
    }

    const accessToken = generateAccessToken({ customerId, phone_number });
    const plainRefreshToken = generateRefreshTokenPlain();
    const refreshTokenHash = hashToken(plainRefreshToken);
    const refreshExpiresAt = refreshTokenExpiryDate();

    await pool.query(`DELETE FROM refresh_tokens WHERE phone_number=$1`, [phone_number]);

    await pool.query(
      `INSERT INTO refresh_tokens
       (phone_number, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [phone_number, refreshTokenHash, refreshExpiresAt]
    );

    res.json({
      customerId,
      phone_number,
      accessToken,
      accessTokenExpiry: ACCESS_TOKEN_EXPIRY,
      refreshToken: plainRefreshToken,
      refreshTokenExpiry: refreshExpiresAt,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

//refresh tokens

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
    });

    res.json({
      accessToken: newAccessToken,
      message: "Access token refreshed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Refresh token failed" });
  }
};

//get otp

export const getOtpList = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
    
      const result = await pool.query(`SELECT * FROM otp_store`);
      return res.json(result.rows);
    }


    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const result = await pool.query(`SELECT * FROM otp_store`);
      return res.json(result.rows);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired", expiredAt: err.expiredAt });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch OTPs" });
  }
};

//refresh tokens

export const getAllRefreshTokens = async (req, res) => {
  const result = await pool.query(`SELECT * FROM refresh_tokens`);
  res.json(result.rows);
};
