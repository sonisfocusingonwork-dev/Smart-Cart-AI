import express from 'express';
import { 
  getCarts, 
  createCart, 
  updateCart, 
  deleteCart, 
  assignMockCustomer,
  bulkUpdateCarts,
  exportCarts
} from '../controllers/cart.controller.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCarts);
router.get('/export', adminAuth, exportCarts);
router.post('/', adminAuth, createCart);
router.post('/assign-mock', assignMockCustomer);
router.post('/bulk-update', adminAuth, bulkUpdateCarts);
router.put('/:id', adminAuth, updateCart);
router.delete('/:id', adminAuth, deleteCart);

export default router;
