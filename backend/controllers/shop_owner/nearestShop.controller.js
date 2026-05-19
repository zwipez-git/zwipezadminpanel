import NearestShop from "../../models/nearestShop.model.js";
import { calculateDistance } from "../../utils/distance.js";

/**
 * GET all shop details
 * Route: GET /api/shops-mongo
 */
export const getAllShops = async (req, res) => {
  try {
    const shops = await NearestShop.find({});
    
    return res.status(200).json({
      success: true,
      count: shops.length,
      data: shops,
    });
  } catch (error) {
    console.error("❌ Error in getAllShops:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching shops",
      error: error.message,
    });
  }
};

/**
 * GET nearest shop based on user location
 * Route: GET /api/shops-mongo/nearest?lat=13.0827&lng=80.2707
 */
export const getNearestShop = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Please provide user geolocation coordinates (lat and lng query parameters)",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude value",
      });
    }

    // Fetch all shops from MongoDB
    const shops = await NearestShop.find({});

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shops found in the database",
      });
    }

    let nearestShop = null;
    let shortestDistance = Infinity;

    // Compare user location with all shops using the Haversine formula
    shops.forEach((shop) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        shop.latitude,
        shop.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestShop = shop;
      }
    });

    if (!nearestShop) {
      return res.status(404).json({
        success: false,
        message: "Could not calculate the nearest shop",
      });
    }

    // Return the single nearest shop details along with calculated distance
    return res.status(200).json({
      success: true,
      message: "Nearest shop calculated successfully",
      distance_km: parseFloat(shortestDistance.toFixed(3)),
      data: nearestShop,
    });
  } catch (error) {
    console.error("❌ Error in getNearestShop:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while finding the nearest shop",
      error: error.message,
    });
  }
};

/**
 * GET nearest shop products based on user location
 * Route: GET /api/shops-mongo/nearest/products?lat=13.0827&lng=80.2707
 */
export const getNearestShopProducts = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Please provide user geolocation coordinates (lat and lng query parameters)",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude value",
      });
    }

    // Fetch all shops from MongoDB
    const shops = await NearestShop.find({});

    if (shops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shops found in the database",
      });
    }

    let nearestShop = null;
    let shortestDistance = Infinity;

    // Find nearest shop
    shops.forEach((shop) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        shop.latitude,
        shop.longitude
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestShop = shop;
      }
    });

    if (!nearestShop) {
      return res.status(404).json({
        success: false,
        message: "Could not calculate the nearest shop",
      });
    }

    // Return ONLY that shop's products
    return res.status(200).json({
      success: true,
      shop_id: nearestShop.shop_id,
      shop_name: nearestShop.shop_name,
      distance_km: parseFloat(shortestDistance.toFixed(3)),
      products: nearestShop.products,
    });
  } catch (error) {
    console.error("❌ Error in getNearestShopProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching nearest shop products",
      error: error.message,
    });
  }
};
