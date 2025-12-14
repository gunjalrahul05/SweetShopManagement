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

// Search sweets by name, category, or price range
export const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    // Build search query
    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    const sweets = await Sweet.find(query).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      message: 'Sweets retrieved successfully',
      data: sweets
    });
  } catch (error) {
    console.error('Error searching sweets:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching sweets',
      error: error.message
    });
  }
};

// Update a sweet
export const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;

    // Find the sweet
    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    // Validate price and quantity if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a non-negative number'
      });
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a non-negative number'
      });
    }

    // Update only provided fields
    if (name !== undefined) sweet.name = name;
    if (category !== undefined) sweet.category = category;
    if (price !== undefined) sweet.price = price;
    if (quantity !== undefined) sweet.quantity = quantity;

    await sweet.save();

    res.status(200).json({
      success: true,
      message: 'Sweet updated successfully',
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
    console.error('Error updating sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sweet',
      error: error.message
    });
  }
};

// Delete a sweet (Admin only)
export const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    await Sweet.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Sweet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sweet',
      error: error.message
    });
  }
};

// Purchase a sweet (decrease quantity)
export const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity to purchase'
      });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    if (sweet.quantity === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sweet is out of stock'
      });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity. Available: ${sweet.quantity}`
      });
    }

    sweet.quantity -= quantity;
    await sweet.save();

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      data: {
        id: sweet._id,
        name: sweet.name,
        quantity: sweet.quantity,
        purchased: quantity
      }
    });
  } catch (error) {
    console.error('Error purchasing sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing purchase',
      error: error.message
    });
  }
};

// Restock a sweet (increase quantity) - Admin only
export const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid quantity to restock'
      });
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return res.status(404).json({
        success: false,
        message: 'Sweet not found'
      });
    }

    sweet.quantity += quantity;
    await sweet.save();

    res.status(200).json({
      success: true,
      message: 'Restock successful',
      data: {
        id: sweet._id,
        name: sweet.name,
        quantity: sweet.quantity,
        restocked: quantity
      }
    });
  } catch (error) {
    console.error('Error restocking sweet:', error);
    res.status(500).json({
      success: false,
      message: 'Error restocking sweet',
      error: error.message
    });
  }
};

