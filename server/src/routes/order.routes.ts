import express from 'express';
import { getOrders, createOrder } from '../controllers/order.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Only admins can view all orders
router.get('/', verifyToken, checkRole(['RootAdmin', 'StoreManager', 'admin']), getOrders);
// Authenticated customers can create orders
router.post('/', verifyToken, createOrder);

export default router;
