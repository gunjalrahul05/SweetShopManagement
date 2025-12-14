// Sweet routes

import express from 'express';
import { getAllSweets, createSweet } from '../controllers/sweetController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// - Get all sweets
router.get('/', getAllSweets);

// - Create a new sweet
router.post('/', createSweet);

export default router;

