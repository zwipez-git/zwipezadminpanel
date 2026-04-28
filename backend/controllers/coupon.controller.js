import pool from '../db/db.js'




// ADD COUPON
export const addCoupon = async (req, res) => {

try {

const {
code,
type,
value,
min_order,
max_discount,
starts_at,
expires_at,
is_new_user
} = req.body;

const result = await pool.query(
`INSERT INTO coupons
(code,type,value,min_order,max_discount,starts_at,expires_at,is_new_user)
VALUES($1,$2,$3,$4,$5,$6,$7,$8)
RETURNING *`,
[
code,
type,
value,
min_order || 0,
max_discount || null,
starts_at || null,
expires_at || null,
is_new_user || false
]
);

res.json({
message:"Coupon added",
coupon: result.rows[0]
});

} catch(err) {

console.error(err);
res.status(500).json({message:"Failed to add coupon"});

}

};


// GET COUPONS
// export const getCoupons = async (req, res) => {

//   try {

//     const result = await pool.query(
//       `SELECT * FROM coupons WHERE is_active=true`
//     );

//     res.json(result.rows);

//   } catch (err) {
//     res.status(500).json({ message: "Fetch coupons failed" });
//   }

// };
export const getCoupons = async (req, res) => {
  try {

    const customerId = req.headers.id;

    // optional: auto expire (good practice)
    await pool.query(`
      UPDATE coupons
      SET is_active=false
      WHERE expires_at IS NOT NULL
      AND expires_at < NOW()
    `);

    const result = await pool.query(`
      SELECT * FROM coupons c
      WHERE c.is_active=true

      -- ✅ ADD HERE
      AND (c.expires_at IS NULL OR c.expires_at > NOW())

      -- ✅ hide used coupons
      AND NOT EXISTS (
        SELECT 1 FROM coupon_usage cu
        WHERE cu.coupon_id = c.id
        AND cu.customer_id = $1
      )
    `, [customerId]);

    if (result.rows.length === 0) {
      return res.json({
        message: "No coupons available",
        coupons: []
      });
    }

    res.json({ coupons: result.rows });

  } catch (err) {
    res.status(500).json({ message: "Fetch coupons failed" });
  }
};
// APPLY COUPON
// export const applyCoupon = async (req, res) => {

//   try {

//     const customerId = req.headers.id;
//     const { couponCode, cartTotal } = req.body;

//     const couponResult = await pool.query(
//       `SELECT * FROM coupons
//        WHERE code=$1
//        AND is_active=true
//        AND (expires_at IS NULL OR expires_at > NOW())`,
//       [couponCode]
//     );

//     if (!couponResult.rows.length) {
//       return res.status(400).json({ message: "Invalid coupon" });
//     }

//     const coupon = couponResult.rows[0];

  
//     const used = await pool.query(
//       `SELECT * FROM coupon_usage
//        WHERE customer_id=$1 AND coupon_id=$2`,
//       [customerId, coupon.id]
//     );

//     if (used.rows.length) {
//       return res.status(400).json({ message: "Coupon already used" });
//     }

//     if (cartTotal < coupon.min_order) {
//       return res.status(400).json({ message: "Minimum order not reached" });
//     }

//     let discount = 0;

//     if (coupon.type === "percent") {
//       discount = cartTotal * (coupon.value / 100);

//       if (coupon.max_discount) {
//         discount = Math.min(discount, coupon.max_discount);
//       }
//     }

//     if (coupon.type === "flat") {
//       discount = coupon.value;
//     }

//     const finalTotal = cartTotal - discount;

  
//     await pool.query(
//       `INSERT INTO coupon_usage(customer_id,coupon_id)
//        VALUES($1,$2)`,
//       [customerId, coupon.id]
//     );

//     res.json({
//       cartTotal,
//       discount,
//       finalTotal
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Coupon apply failed" });
//   }

// };

export const applyCoupon = async (req, res) => {
  try {

    const customerId = req.headers.id;
    const { couponCode, cartTotal } = req.body;

    // ✅ Expire old coupons
await pool.query(`
  UPDATE coupons
  SET is_active=false
  WHERE expires_at IS NOT NULL
  AND expires_at < NOW()
`);
    // ✅ Get coupon
    const couponResult = await pool.query(
      `SELECT * FROM coupons
       WHERE code=$1 AND is_active=true`,
      [couponCode]
    );

    if (!couponResult.rows.length) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    const coupon = couponResult.rows[0];

    // ✅ Check already used
    const used = await pool.query(
      `SELECT * FROM coupon_usage
       WHERE customer_id=$1 AND coupon_id=$2`,
      [customerId, coupon.id]
    );

    if (used.rows.length) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    // ✅ Min order check
    if (cartTotal < coupon.min_order) {
      return res.status(400).json({ message: "Minimum order not reached" });
    }

    let discount = 0;

    if (coupon.type === "percent") {
      discount = cartTotal * (coupon.value / 100);

      if (coupon.max_discount) {
        discount = Math.min(discount, coupon.max_discount);
      }
    }

    if (coupon.type === "flat") {
      discount = coupon.value;
    }

    const finalTotal = cartTotal - discount;

    // ✅ Save usage
    await pool.query(
      `INSERT INTO coupon_usage(customer_id,coupon_id)
       VALUES($1,$2)`,
      [customerId, coupon.id]
    );

    res.json({
      cartTotal,
      discount,
      finalTotal
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Coupon apply failed" });
  }
};


