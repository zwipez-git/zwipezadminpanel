import express from 'express'
import {
    acceptOrder,updateStatus
} from '../controllers/agents.controller.js'

const router=express.Router();
router.post("/acceptOrder",acceptOrder)
router.post("/updateStatus",updateStatus)


export default router;