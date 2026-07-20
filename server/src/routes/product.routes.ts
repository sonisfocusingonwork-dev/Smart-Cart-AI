import express from 'express';
import { getProducts, getLowStockProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/low-stock', getLowStockProducts);
router.get('/', getProducts);
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);

export default router;
