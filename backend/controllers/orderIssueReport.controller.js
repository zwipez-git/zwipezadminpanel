import pool from "../db/db.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toInt = (v) => {
  const n = typeof v === "string" ? Number(v.trim()) : Number(v);
  return Number.isNaN(n) ? null : n;
};

const uploadBufferToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const folder =
      process.env.CLOUDINARY_REPORTS_FOLDER ||
      "reports/order_issue_images";

    const stream = cloudinary.v2.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const createOrderIssueReport = async (req, res) => {
  try {
    const {
      shop_id,
      delivery_partner_id,
      deliveryboy_id,
      customer_id,
      order_id,
      product_id,
      order_item_id,
      reason,
    } = req.body || {};

    // multer image
    if (!req.file?.buffer) {
      return res
        .status(400)
        .json({ status: 0, message: "image file is required (field: image)" });
    }

    const fileBuffer = req.file.buffer;

    if (!reason || !String(reason).trim()) {
      return res
        .status(400)
        .json({ status: 0, message: "reason is required" });
    }

    // Prefer ids from auth payload when available
    const tokenCustomerId = req.user?.customerId;
    const tokenDeliveryPartnerId = req.user?.deliveryId;
    const tokenShopId = req.user?.shop_id;

    const finalShopId = toInt(tokenShopId) ?? toInt(shop_id);
    const finalDeliveryPartnerId =
      toInt(tokenDeliveryPartnerId) ?? toInt(delivery_partner_id) ?? toInt(deliveryboy_id);
    const finalCustomerId = toInt(tokenCustomerId) ?? toInt(customer_id);
    const finalOrderId = toInt(order_id);
    const finalProductId = toInt(product_id);
    const finalOrderItemId = toInt(order_item_id);

    if (!finalShopId || !finalCustomerId || !finalOrderId || !finalProductId || !finalDeliveryPartnerId) {
      return res.status(400).json({
        status: 0,
        message:
          "shop_id, deliveryboy_id(delivery_partner_id), customer_id, order_id, product_id are required",
      });
    }

    const uploaded = await uploadBufferToCloudinary(fileBuffer);
    const imageUrl = uploaded?.secure_url;

    if (!imageUrl) {
      return res
        .status(500)
        .json({ status: 0, message: "Cloudinary upload failed (missing secure_url)" });
    }

    const insert = await pool.query(
      `
      INSERT INTO order_issue_reports
        (shop_id, delivery_partner_id, customer_id, order_id, product_id, order_item_id, reason, cloudinary_image_url)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        finalShopId,
        finalDeliveryPartnerId,
        finalCustomerId,
        finalOrderId,
        finalProductId,
        finalOrderItemId,
        String(reason).trim(),
        imageUrl,
      ]
    );

    return res.json({
      status: 1,
      message: "Issue reported successfully",
      data: insert.rows[0],
    });
  } catch (err) {
    console.error("createOrderIssueReport error:", err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

