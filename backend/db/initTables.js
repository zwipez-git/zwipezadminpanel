import pool from "./db.js";

export const initTables = async () => {
  try {
//otp store table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_store (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_otp_phone
      ON otp_store(phone_number);
    `);

  //refresh tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_refresh_token UNIQUE (token_hash)
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_refresh_phone
      ON refresh_tokens(phone_number);
    `);

//categories table 
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  //product table  country VARCHAR(100),
    await pool.query(`CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  original_price NUMERIC(10,2),
  price NUMERIC(10,2),
 
  unit VARCHAR(50),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);

//mega offer table   country VARCHAR(100),
      await pool.query(`
        CREATE TABLE IF NOT EXISTS  mega_offers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2),
  offer_price NUMERIC(10,2),

  unit VARCHAR(50),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    `);

    
    //users
     await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
         email VARCHAR(100) NOT NULL,
         password VARCHAR(100) NOT NULL,

          role VARCHAR(50) NOT NULL DEFAULT 'user',
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
//customers   country VARCHAR(100),
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers(
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100),
  gender VARCHAR(10),
  dob DATE,
  city VARCHAR(100),
  state VARCHAR(100),

  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
`)
//banner images
  await pool.query(`
    CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    `);
//cart
await pool.query(`
  CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

`)

//cart items     country VARCHAR(100),

await pool.query(`
  CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,

  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,

  product_id INTEGER REFERENCES products(id),
  category_id INTEGER REFERENCES categories(id),

  unit VARCHAR(50),


  price NUMERIC(10,2),
  quantity NUMERIC(10,2),
  total NUMERIC(10,2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(cart_id, product_id)
);
`)
    console.log(" All tables created ");
  } catch (error) {
    console.error("Table creation failed:", error.message);
    process.exit(1);
  }
};
