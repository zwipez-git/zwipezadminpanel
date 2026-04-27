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
    // 🔥 ADD ROLE COLUMN (SAFE)
   await pool.query(`
      ALTER TABLE refresh_tokens
      ADD COLUMN IF NOT EXISTS role VARCHAR(20);
`   );

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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
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
     await pool.query(`
 ALTER TABLE products
ADD COLUMN IF NOT EXISTS shop_id INT REFERENCES shops(shop_id);
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
    

// For Mobile Aplications

//customers   ,
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers(
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  email VARCHAR(100),
  gender VARCHAR(10),
  dob DATE,
   role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);
`)


// // Alter the table
// await pool.query(`
//   ALTER TABLE customers 
//   ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer';
// `);

// // Update the tabel
// await pool.query(`
//   UPDATE customers 
//   SET role = 'customer' 
//   WHERE role IS NULL;
// `);


// create address table for multiple address adding

// customer addresses table
await pool.query(`
  CREATE TABLE IF NOT EXISTS customer_addresses (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,

    type VARCHAR(50), -- home, office, other
    address_line TEXT,

    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pincode VARCHAR(10),

    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// Only 1 default address per user 
await pool.query(`
  CREATE UNIQUE INDEX IF NOT EXISTS one_default_address
  ON customer_addresses(customer_id)
  WHERE is_default = true;
`);



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
  original_price NUMERIC(10,2),
  price NUMERIC(10,2),
  is_mega_offer BOOLEAN DEFAULT false,
  quantity INTEGER,
  total NUMERIC(10,2),


  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(cart_id, product_id)
  
);
`)
await pool.query(`
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS shop_id INT;
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
  ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS instructions TEXT;
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


// //delivery agents
//     // device_token TEXT,
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
//SHOP_OWNER
await pool.query(`
  CREATE TABLE IF NOT EXISTS shops (
    shop_id SERIAL PRIMARY KEY,
    shop_name VARCHAR(150),
    owner_name VARCHAR(150),
    phone_number VARCHAR(15) UNIQUE,
    address TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
// ADD SHOP IMAGE + CERTIFICATE (SAFE)
await pool.query(`
 ALTER TABLE shops
ADD COLUMN IF NOT EXISTS shop_image_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_image_url TEXT,
ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS opening_time TIME,
ADD COLUMN IF NOT EXISTS closing_time TIME,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
`);
await pool.query(`
  ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS shop_id INT;
`);
// shop owner add product
await pool.query(`
CREATE TABLE IF NOT EXISTS shop_products (
  id SERIAL PRIMARY KEY,
  shop_id INT NOT NULL,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  price NUMERIC(10,2),
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(shop_id, product_id)
);
`);


    console.log(" All tables created ");
  } catch (error) {
    console.error("Table creation failed:", error.message);
    process.exit(1);
  }

};
