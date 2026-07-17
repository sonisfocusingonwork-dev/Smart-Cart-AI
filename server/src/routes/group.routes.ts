import express from 'express';
import {
  getGroupSession,
  createGroupSession,
  updateGroupSession,
  joinGroupSession,
  leaveGroupSession
} from '../controllers/group.controller.js';

const router = express.Router();

router.get('/:code', getGroupSession);
router.post('/', createGroupSession);
router.put('/:code', updateGroupSession);
router.post('/:code/join', joinGroupSession);
router.post('/:code/leave', leaveGroupSession);

export default router;
