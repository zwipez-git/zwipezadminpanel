import mongoose from "mongoose";

// Sub-document schema for Products
const ProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      trim: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },
    image_url: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// Main schema for Nearest Shops
const NearestShopSchema = new mongoose.Schema(
  {
    shop_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    shop_name: {
      type: String,
      required: true,
      trim: true,
    },
    shop_address: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    // Optional GeoJSON support for MongoDB Native Geolocation queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    products: {
      type: [ProductSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

NearestShopSchema.index({ location: "2dsphere" });

const NearestShop = mongoose.model("NearestShop", NearestShopSchema);

export default NearestShop;
