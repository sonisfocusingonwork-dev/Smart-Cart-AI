import express from 'express';
import {
  loginCustomer,
  registerCustomer,
  loginWithQR,
  verifyCustomerEmail,
  updateCustomerPoints,
  updateCustomerPointsByPhone,
  getCustomers
} from '../controllers/customer.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, checkRole(['RootAdmin', 'StoreManager', 'admin']), getCustomers);
router.post('/login', loginCustomer);
router.post('/register', registerCustomer);
router.post('/login-qr', loginWithQR);
router.post('/verify-email', verifyCustomerEmail);
router.put('/:customerId/points', updateCustomerPoints);
router.put('/phone/:phoneNumber/points', updateCustomerPointsByPhone);

export default router;
