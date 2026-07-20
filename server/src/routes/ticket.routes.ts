import express from 'express';
import { getTickets, updateTicketStatus } from '../controllers/ticket.controller.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(checkRole(['RootAdmin', 'StoreManager', 'admin', 'Tech', 'Security'])); // Various admin roles can access helpdesk

router.get('/', getTickets);
router.put('/:id/status', updateTicketStatus);

export default router;
