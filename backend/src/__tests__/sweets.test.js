// Tests for sweets endpoints
// Following TDD approach - tests written first

import request from 'supertest';
import app from '../server.js';
import Sweet from '../models/Sweet.js';
import User from '../models/User.js';
import { connectDatabase, closeDatabase } from '../database/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Sweets API', () => {
  let authToken;
  let testUser;

  // Setup: Connect to test database and create a test user
  beforeAll(async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/sweetshop_test';
    process.env.JWT_SECRET = 'test-secret-key';
    await connectDatabase();

    // Create a test user for authentication
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });
    await testUser.save();

    // Generate token for the test user
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  });

  // Cleanup: Close database connection after all tests
  afterAll(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});
    await closeDatabase();
  });

  // Clean up sweets before each test
  beforeEach(async () => {
    await Sweet.deleteMany({});
  });

  // Test GET /api/sweets - Get all sweets
  describe('GET /api/sweets', () => {
    test('should get all sweets when authenticated', async () => {
      await Sweet.create([
        {
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100
        },
        {
          name: 'Gummy Bears',
          category: 'Gummies',
          price: 1.75,
          quantity: 50
        }
      ]);

      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('category');
      expect(response.body.data[0]).toHaveProperty('price');
      expect(response.body.data[0]).toHaveProperty('quantity');
    });

    test('should return empty array when no sweets exist', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  // Test POST /api/sweets - Create a new sweet
  describe('POST /api/sweets', () => {
    test('should create a new sweet when authenticated', async () => {
      const sweetData = {
        name: 'Lollipop',
        category: 'Hard Candy',
        price: 0.50,
        quantity: 200
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sweet created successfully');
      expect(response.body.data.name).toBe(sweetData.name);
      expect(response.body.data.category).toBe(sweetData.category);
      expect(response.body.data.price).toBe(sweetData.price);
      expect(response.body.data.quantity).toBe(sweetData.quantity);
      expect(response.body.data).toHaveProperty('id');
    });

    test('should not create sweet with missing required fields', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Sweet'
          // Missing category, price, quantity
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('provide');
    });

    test('should not create sweet with invalid price (negative)', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: -10,
          quantity: 10
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should not create sweet with invalid quantity (negative)', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 10,
          quantity: -5
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 10,
          quantity: 5
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  // Test GET /api/sweets/search - Search sweets
  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Create test sweets for search
      await Sweet.create([
        {
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100
        },
        {
          name: 'Dark Chocolate',
          category: 'Chocolate',
          price: 3.00,
          quantity: 50
        },
        {
          name: 'Gummy Bears',
          category: 'Gummies',
          price: 1.75,
          quantity: 200
        },
        {
          name: 'Lollipop',
          category: 'Hard Candy',
          price: 0.50,
          quantity: 150
        }
      ]);
    });

    test('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ name: 'Chocolate' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Chocolate');
    });

    test('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'Chocolate' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(sweet => sweet.category === 'Chocolate')).toBe(true);
    });

    test('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ minPrice: 2.0, maxPrice: 3.0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(sweet => sweet.price >= 2.0 && sweet.price <= 3.0)).toBe(true);
    });

    test('should search sweets with multiple filters', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'Chocolate', minPrice: 2.0 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(sweet => 
        sweet.category === 'Chocolate' && sweet.price >= 2.0
      )).toBe(true);
    });

    test('should return empty array when no sweets match', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ name: 'NonExistentSweet' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/sweets/search')
        .query({ name: 'Chocolate' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  // Test PUT /api/sweets/:id - Update a sweet
  describe('PUT /api/sweets/:id', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Original Sweet',
        category: 'Original',
        price: 1.00,
        quantity: 100
      });
    });

    test('should update a sweet successfully', async () => {
      const updateData = {
        name: 'Updated Sweet',
        price: 2.50
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sweet updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.category).toBe(testSweet.category); // Should remain unchanged
    });

    test('should update only provided fields', async () => {
      const updateData = {
        quantity: 200
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(200);
      expect(response.body.data.name).toBe(testSweet.name); // Should remain unchanged
    });

    test('should not update with invalid price (negative)', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ price: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should not update with invalid quantity (negative)', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  // Test DELETE /api/sweets/:id - Delete a sweet (Admin only)
  describe('DELETE /api/sweets/:id', () => {
    let adminToken;
    let adminUser;
    let testSweet;

    beforeAll(async () => {
      // Clean up any existing admin user first
      await User.deleteMany({ username: 'admin' });
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();

      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Sweet to Delete',
        category: 'Test',
        price: 1.00,
        quantity: 50
      });
    });

    test('should delete a sweet when admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sweet deleted successfully');

      // Verify sweet is deleted
      const deletedSweet = await Sweet.findById(testSweet._id);
      expect(deletedSweet).toBeNull();
    });

    test('should not delete sweet when regular user (non-admin)', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin');
    });

    test('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
  });

  // Test POST /api/sweets/:id/purchase 
  describe('POST /api/sweets/:id/purchase', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Purchasable Sweet',
        category: 'Test',
        price: 2.50,
        quantity: 100
      });
    });

    test('should purchase a sweet and decrease quantity', async () => {
      const initialQuantity = testSweet.quantity;
      const purchaseQuantity = 5;

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: purchaseQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Purchase successful');
      expect(response.body.data.quantity).toBe(initialQuantity - purchaseQuantity);

      const updatedSweet = await Sweet.findById(testSweet._id);
      expect(updatedSweet.quantity).toBe(initialQuantity - purchaseQuantity);
    });

    test('should not purchase more than available quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 200 }) // More than available (100)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message.toLowerCase()).toContain('insufficient');
    });

    test('should not purchase when quantity is zero', async () => {

        testSweet.quantity = 0;
      await testSweet.save();

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 1 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should require quantity in request body', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 1 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/purchase`)
        .send({ quantity: 1 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Test POST /api/sweets/:id/restock - Restock a sweet (Admin only)
  describe('POST /api/sweets/:id/restock', () => {
    let adminToken;
    let adminUser;
    let testSweet;

    beforeAll(async () => {
      // Clean up any existing admin user first
      await User.deleteMany({ username: 'admin' });
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await adminUser.save();

      adminToken = jwt.sign(
        { userId: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Sweet to Restock',
        category: 'Test',
        price: 1.50,
        quantity: 50
      });
    });

    test('should restock a sweet and increase quantity when admin', async () => {
      const initialQuantity = testSweet.quantity;
      const restockQuantity = 100;

      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: restockQuantity })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Restock successful');
      expect(response.body.data.quantity).toBe(initialQuantity + restockQuantity);


      const updatedSweet = await Sweet.findById(testSweet._id);
      expect(updatedSweet.quantity).toBe(initialQuantity + restockQuantity);
    });

    test('should not restock when regular user (non-admin)', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 50 })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Admin');
    });

    test('should require quantity in request body', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should not restock with negative quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/sweets/${fakeId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet._id}/restock`)
        .send({ quantity: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

