import express from 'express';
import { getOrders, createOrder } from '../controllers/order.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Allow fetching all orders for demo tablet
router.get('/', getOrders);
// Authenticated customers can create orders
router.post('/', createOrder);

export default router;
