import express from 'express';
import { createQrSession, scanQrSession, pairQrSession } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/qr-session/create', createQrSession);
router.post('/qr-session/scan', scanQrSession);
router.post('/qr-session/pair', pairQrSession);

export default router;
