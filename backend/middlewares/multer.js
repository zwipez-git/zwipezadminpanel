import multer from "multer";

const storage = multer.memoryStorage(); // 🔥 NO FOLDER

const upload = multer({ storage });

export default upload;