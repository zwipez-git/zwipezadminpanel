import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const getCloudinarySignature = (req, res) => {
 
  try {
    const timestamp = Math.floor(Date.now() / 1000);

   const { type, shopId } = req.query;

    if (!type || !shopId) {
      return res.status(400).json({ message: "type & shopId required" });
    }
console.log("SIGNATURE API HIT");
console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("🔥 NEW CLOUDINARY CONTROLLER RUNNING");
    let folder;

    if (type === "shop") {
      folder = `stores/shop_images/${shopId}`;
    } else if (type === "certificate") {
      folder = `stores/shop_certificates/${shopId}`;
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
    // const folder = req.query.folder;

    // if (!folder) {
    //   return res.status(400).json({ message: "Folder is required" });
    // }

    const signature = cloudinary.v2.utils.api_sign_request(
      {
        timestamp,
        folder, 
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signature error" });
  }
  
};

