import express from 'express';
import { leadController } from '../controllers/lead.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', leadController.getAllLeads);
router.get('/:id', leadController.getLead);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

export default router;