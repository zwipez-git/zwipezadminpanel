import pool from "../../db/db.js";

// Stores immutable delivered-order snapshot for delivery analytics/history.
export const storeDeliveredOrderSnapshot = async (client, acceptedOrderRow) => {
  const dbClient = client || pool;

  const deliveredAt = acceptedOrderRow.delivered_at || new Date();

  const inserted = await dbClient.query(
    `INSERT INTO delivery_partner_delivered_orders (
      delivery_partner_order_accept_id,
      delivery_partner_id,
      order_id,
      shop_id,
      customer_id,
      order_number,
      total_amount,
      tax,
      discount,
      delivery_charge,
      grand_total,
      coupon_code,
      payment_method,
      address,
      instructions,
      accepted_at,
      delivered_at,
      updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
    )
    ON CONFLICT (order_id) DO UPDATE SET
      delivery_partner_order_accept_id = EXCLUDED.delivery_partner_order_accept_id,
      delivery_partner_id = EXCLUDED.delivery_partner_id,
      shop_id = EXCLUDED.shop_id,
      customer_id = EXCLUDED.customer_id,
      order_number = EXCLUDED.order_number,
      total_amount = EXCLUDED.total_amount,
      tax = EXCLUDED.tax,
      discount = EXCLUDED.discount,
      delivery_charge = EXCLUDED.delivery_charge,
      grand_total = EXCLUDED.grand_total,
      coupon_code = EXCLUDED.coupon_code,
      payment_method = EXCLUDED.payment_method,
      address = EXCLUDED.address,
      instructions = EXCLUDED.instructions,
      accepted_at = EXCLUDED.accepted_at,
      delivered_at = EXCLUDED.delivered_at,
      updated_at = NOW()
    RETURNING *`,
    [
      acceptedOrderRow.id,
      acceptedOrderRow.delivery_partner_id,
      acceptedOrderRow.order_id,
      acceptedOrderRow.shop_id,
      acceptedOrderRow.customer_id,
      acceptedOrderRow.order_number,
      acceptedOrderRow.total_amount,
      acceptedOrderRow.tax,
      acceptedOrderRow.discount,
      acceptedOrderRow.delivery_charge,
      acceptedOrderRow.grand_total,
      acceptedOrderRow.coupon_code,
      acceptedOrderRow.payment_method,
      acceptedOrderRow.address,
      acceptedOrderRow.instructions,
      acceptedOrderRow.accepted_at,
      deliveredAt,
    ]
  );

  return inserted.rows[0];
};
