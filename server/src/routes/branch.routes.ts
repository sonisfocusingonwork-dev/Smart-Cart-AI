import express from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branch.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
// Assuming anyone logged in (or specific roles) can see branches. 
// We will restrict to RootAdmin and StoreManager for now, same as staff management.
router.use(checkRole(['RootAdmin', 'StoreManager', 'admin']));

router.get('/', getBranches);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

export default router;
