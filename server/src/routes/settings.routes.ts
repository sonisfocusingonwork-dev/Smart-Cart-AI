import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(['RootAdmin', 'admin']));

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
