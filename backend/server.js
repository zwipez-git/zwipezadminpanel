import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import addressRoutes from "./routes/address.route.js"
import authRoutes from "./routes/auth.route.js";
import categoryRoutes from "./routes/category.route.js";
import productRoutes from "./routes/product.route.js";
import cloudinaryRoutes from "./routes/cloudinary.route.js";
import login from './routes/login.route.js'
import signup from './routes/signup.route.js'
import { initTables } from "./db/initTables.js";
import customerRoutes from './routes/customers.route.js'
import megaofferRoutes from './routes/megaoffer.route.js'
import BannerImagesRoutes from './routes/banner.route.js'
import homeRoutes from './routes/home.route.js'
import cartRoutes from './routes/cart.route.js'
import DashboardRoutes from './routes/dashboad.route.js'
import CouponRoutes from './routes/coupon.route.js'
import OrderRoutes from './routes/order.route.js'
import agentsRoutes from './routes/agents.route.js'
dotenv.config();

const app = express();

app.use(cors())

app.use(express.json());




app.use("/", homeRoutes);
app.get("/", (req, res) => {
  res.send(" Fruvvy Auth Backend Service Running");
});

app.get("/devapiService", (req, res) => {
  res.send(" Fruvvy Auth Service Running");
});

app.use("/devapiService", authRoutes);
app.use("/signup", signup);
app.use("/login", login);
app.use("/api", cloudinaryRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", BannerImagesRoutes);
app.use("/api", megaofferRoutes);
app.use("/api", addressRoutes);

app.use("/api",cartRoutes );
app.use("/user", customerRoutes);
app.use("/api",DashboardRoutes)
app.use("/api",CouponRoutes)
app.use("/api",OrderRoutes)
app.use("/api",agentsRoutes)

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initTables();

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(" Server failed to start:", err);
    process.exit(1);
  }
};

startServer();
