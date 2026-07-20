import express from 'express';
import { getDashboardOverview, getCategoryPieData } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/overview', getDashboardOverview);
router.get('/pie', getCategoryPieData);

export default router;
