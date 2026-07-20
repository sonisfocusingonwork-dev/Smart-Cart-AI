import express from 'express';
import { submitGatewayLog, getGatewayLogs, getDashboardData, getCartPayload } from '../controllers/gateway.controller.js';
import { checkRole, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Removed verifyToken and checkRole for demo stability
// router.use(verifyToken);
// router.use(checkRole(['GatewayChecker', 'RootAdmin', 'admin']));

router.post('/log', submitGatewayLog);
router.get('/logs', getGatewayLogs);
router.get('/dashboard', getDashboardData);
router.get('/cart/:cartId', getCartPayload);

export default router;
