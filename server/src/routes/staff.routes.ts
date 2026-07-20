import express from 'express';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../controllers/staff.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(['RootAdmin', 'StoreManager', 'admin']));

router.get('/', getStaff);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

export default router;
