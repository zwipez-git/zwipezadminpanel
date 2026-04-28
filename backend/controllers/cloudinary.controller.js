import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// export const getCloudinarySignature = (req, res) => {
 
//   try {
//     const timestamp = Math.floor(Date.now() / 1000);

//    const { type, shopId } = req.query;

//     if (!type || !shopId) {
//       return res.status(400).json({ message: "type & shopId required" });
//     }
// console.log("SIGNATURE API HIT");
// console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("🔥 NEW CLOUDINARY CONTROLLER RUNNING");
//     let folder;

//     if (type === "shop") {
//       folder = `stores/shop_images/${shopId}`;
//     } else if (type === "certificate") {
//       folder = `stores/shop_certificates/${shopId}`;
//     } else {
//       return res.status(400).json({ message: "Invalid type" });
//     }
//     // const folder = req.query.folder;

//     // if (!folder) {
//     //   return res.status(400).json({ message: "Folder is required" });
//     // }

//     const signature = cloudinary.v2.utils.api_sign_request(
//       {
//         timestamp,
//         folder, 
//       },
//       process.env.CLOUDINARY_API_SECRET
//     );

//     res.json({
//       cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//       api_Key: process.env.CLOUDINARY_API_KEY,
//       timestamp,
//       signature,
//       folder, 
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Signature error" });
//   }
  
// };

export const getCloudinarySignature = (req, res) => {
  try {
    // const timestamp = Math.floor(Date.now() / 1000);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const { type, shopId, folder } = req.query;

    let finalFolder;

    // ✅ Admin panel (your case)
    if (folder) {
      finalFolder = folder;
    }

    // ✅ Shop app
    else if (type && shopId) {
      if (type === "shop") {
        finalFolder = `stores/shop_images/${shopId}`;
      } else if (type === "certificate") {
        finalFolder = `stores/shop_certificates/${shopId}`;
      } else {
        return res.status(400).json({ message: "Invalid type" });
      }
    }

    // ❌ Invalid request
    else {
      return res.status(400).json({
        message: "Provide folder OR type & shopId",
      });
    }
console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
    console.log("API SECRET:", process.env.CLOUDINARY_API_SECRET);
    console.log("FOLDER:", finalFolder);
    const signature = cloudinary.v2.utils.api_sign_request(
      {
        timestamp,
        folder: finalFolder,
      },
      process.env.CLOUDINARY_API_SECRET
    );
console.log("BACKEND FOLDER:", finalFolder);
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY, // ✅ IMPORTANT
      timestamp,
      signature,
      folder: finalFolder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signature error" });
  }
};