// Sweet routes

import express from 'express';
import { getAllSweets, createSweet, searchSweets, updateSweet } from '../controllers/sweetController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// - Get all sweets
router.get('/', getAllSweets);

// - Search sweets
router.get('/search', searchSweets);

// - Create a new sweet
router.post('/', createSweet);

// - Update a sweet
router.put('/:id', updateSweet);

export default router;

