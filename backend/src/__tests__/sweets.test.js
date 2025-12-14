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
      // Create some test sweets
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
      expect(response.body.message).toContain('required');
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
});

