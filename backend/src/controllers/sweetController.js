// Sweet controller

import Sweet from '../models/Sweet.js';

// Get all sweets
export const getAllSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find().sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      message: 'Sweets retrieved successfully',
      data: sweets
    });
  } catch (error) {
    console.error('Error getting sweets:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving sweets',
      error: error.message
    });
  }
};

// Create a new sweet
export const createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, price, and quantity'
      });
    }

    if (price < 0 || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price and quantity must be non-negative numbers'
      });
    }

    const sweet = new Sweet({
      name,
      category,
      price,
      quantity
    });

    await sweet.save();

    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: {
        id: sweet._id,
        name: sweet.name,
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        created_at: sweet.created_at,
        updated_at: sweet.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sweet',
      error: error.message
    });
  }
};

