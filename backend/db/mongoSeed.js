import mongoose from "mongoose";
import dotenv from "dotenv";
import NearestShop from "../models/nearestShop.model.js";

// Load environment variables
dotenv.config();

const sampleShops = [
  {
    shop_id: "shop_001",
    shop_name: "FreshMart Supermarket",
    shop_address: "12, Poonamallee High Road, Chennai Central, Chennai, Tamil Nadu 600003",
    latitude: 13.0850, // Very Close to User (lat: 13.0827, lng: 80.2707) ~0.5 km away
    longitude: 80.2750,
    location: {
      type: "Point",
      coordinates: [80.2750, 13.0850], // [longitude, latitude]
    },
    products: [
      {
        product_id: "prod_101",
        product_name: "Fresh Red Apples",
        price: 180.0,
        unit: "1 kg",
        image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
        stock: 50,
        description: "Sweet, crunchy and organic red apples imported from Kashmir.",
      },
      {
        product_id: "prod_102",
        product_name: "Organic Whole Milk",
        price: 60.0,
        unit: "1 Litre",
        image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
        stock: 120,
        description: "Fresh farm-sourced pasteurized whole milk high in calcium.",
      },
      {
        product_id: "prod_103",
        product_name: "Whole Wheat Bread",
        price: 45.0,
        unit: "400g Pack",
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
        stock: 80,
        description: "Freshly baked high-fibre whole wheat sandwich bread.",
      },
      {
        product_id: "prod_104",
        product_name: "Farm Fresh Eggs",
        price: 72.0,
        unit: "6 Pack",
        image_url: "https://images.unsplash.com/photo-1516448626847-a864e03c4a8f",
        stock: 200,
        description: "Premium brown eggs sourced from free-range poultry farms.",
      },
    ],
  },
  {
    shop_id: "shop_002",
    shop_name: "Chennai Grocery Hub",
    shop_address: "78, Sydenhams Road, Periamet, Chennai, Tamil Nadu 600003",
    latitude: 13.0980, // Medium Distance ~2.4 km away
    longitude: 80.2550,
    location: {
      type: "Point",
      coordinates: [80.2550, 13.0980],
    },
    products: [
      {
        product_id: "prod_201",
        product_name: "Premium Basmati Rice",
        price: 110.0,
        unit: "1 kg",
        image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
        stock: 150,
        description: "Long-grain aromatic Basmati rice aged for premium texture and flavour.",
      },
      {
        product_id: "prod_202",
        product_name: "Refined Sunflower Oil",
        price: 140.0,
        unit: "1 Litre",
        image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5",
        stock: 90,
        description: "Healthy and lightweight oil perfect for daily cooking.",
      },
      {
        product_id: "prod_203",
        product_name: "Iodized Table Salt",
        price: 20.0,
        unit: "1 kg",
        image_url: "https://images.unsplash.com/photo-1604928141064-207cea6f571f",
        stock: 300,
        description: "Finely ground iodized salt essential for standard culinary seasoning.",
      },
    ],
  },
  {
    shop_id: "shop_003",
    shop_name: "Organic Valley Stores",
    shop_address: "5, Anna Salai, Mount Road, Chennai, Tamil Nadu 600002",
    latitude: 13.0400, // Farther away ~6.2 km away
    longitude: 80.2300,
    location: {
      type: "Point",
      coordinates: [80.2300, 13.0400],
    },
    products: [
      {
        product_id: "prod_301",
        product_name: "Pure Wild Honey",
        price: 320.0,
        unit: "250g Glass Jar",
        image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38",
        stock: 45,
        description: "100% pure organic wild forest honey, raw and unfiltered.",
      },
      {
        product_id: "prod_302",
        product_name: "Premium Rolled Oats",
        price: 160.0,
        unit: "500g Pack",
        image_url: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df",
        stock: 65,
        description: "High-fibre, gluten-free rolled oats perfect for a healthy breakfast.",
      },
    ],
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/supermarket_delivery";
    
    console.log("⏳ Connecting to MongoDB for seeding...");
    await mongoose.connect(mongoUri);
    console.log("🟢 Connected to MongoDB!");

    // Clear existing shops
    console.log("🗑 Cleaning existing shops...");
    const deleteResult = await NearestShop.deleteMany({});
    console.log(`🧹 Deleted ${deleteResult.deletedCount} existing shops.`);

    // Insert sample shops
    console.log("🌱 Seeding sample shops data...");
    const createdShops = await NearestShop.insertMany(sampleShops);
    console.log(`🎉 Successfully seeded ${createdShops.length} shops with their products!`);

    console.log("\n📍 Seeded Shops Details:");
    createdShops.forEach((s) => {
      console.log(`- ${s.shop_name} [${s.shop_id}] at (lat: ${s.latitude}, lng: ${s.longitude})`);
    });

  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
  } finally {
    console.log("🔌 Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("🟢 Disconnected successfully.");
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();
