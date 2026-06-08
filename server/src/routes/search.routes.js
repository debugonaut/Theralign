import { Router } from 'express';
import { getSuggestions } from '../controllers/search.controller.js';

const router = Router();

// Real-time suggestions - public endpoint (no auth needed)
router.get('/suggestions', getSuggestions);

export default router;
