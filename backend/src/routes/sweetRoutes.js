// Sweet routes

import express from 'express';
import { getAllSweets, createSweet, searchSweets, updateSweet, deleteSweet, purchaseSweet, restockSweet } from '../controllers/sweetController.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

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

// - Delete a sweet (Admin only)
router.delete('/:id', isAdmin, deleteSweet);

// - Purchase a sweet
router.post('/:id/purchase', purchaseSweet);

// - Restock a sweet (Admin only)
router.post('/:id/restock', isAdmin, restockSweet);

export default router;

