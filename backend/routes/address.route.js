    import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress
} from "../controllers/address.contoller.js"
import { authenticateUser } from "../controllers/customers.controller.js";

const router = express.Router();

router.post("/address/post", authenticateUser, addAddress);
router.get("/address/get", authenticateUser, getAddresses);
router.put("/address/put", authenticateUser, updateAddress);
router.delete("/address/delete", authenticateUser, deleteAddress);

export default router;