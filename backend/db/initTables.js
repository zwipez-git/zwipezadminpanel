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
  quantity INTEGER,
  total NUMERIC(10,2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(cart_id, product_id)
);
`)

//coupons tables 


await pool.query(` CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  value NUMERIC NOT NULL,
  min_order NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  is_new_user BOOLEAN DEFAULT false,
  starts_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
  `)

  // coupon usage table
  await pool.query(`
    
  CREATE TABLE IF NOT EXISTS coupon_usage (
  id SERIAL PRIMARY KEY,
  customer_id INT,
  coupon_id INT,
  used_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, coupon_id)
);
    `)


//orders

await pool.query(`
  
  CREATE TABLE IF NOT EXISTS  orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20),
  customer_id INT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL,
  address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  
  
  
  `)

//order items

await pool.query(`
  
  
  
  CREATE TABLE  IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT,
 tax NUMERIC(10,2) DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  quantity INT,
  price NUMERIC(10,2),
  total NUMERIC(10,2)
);`)


//delivery agents
    // device_token TEXT,
await pool.query(`
  
  CREATE TABLE IF NOT EXISTS  agents (
    agent_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    
    online BOOLEAN DEFAULT FALSE,
    
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    

    
    current_order VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`)



    console.log(" All tables created ");
  } catch (error) {
    console.error("Table creation failed:", error.message);
    process.exit(1);
  }
};
