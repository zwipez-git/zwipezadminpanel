import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {console.log("AUTH HEADER:", req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

console.log("TOKEN:", token);
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log("DECODED:", decoded);
    req.user = decoded; // 🔥 VERY IMPORTANT
console.log("JWT SECRET:", process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};