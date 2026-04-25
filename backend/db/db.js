import { Pool, types } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Fix for DATE type (optional but good)
types.setTypeParser(1082, (val) => val);

const isProduction = process.env.NODE_ENV === "production";

let pool;

// If DATABASE_URL exists (production)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Local DB config
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
   ssl: {
    rejectUnauthorized: false, 
  },
  });
}

// Test connection
async function connectDB() {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully");
    client.release(); // IMPORTANT
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
  }
}

connectDB();

//  Handle unexpected errors
pool.on("error", (err) => {
  console.error("Unexpected DB error:", err);
});

export default pool;