# Testing Guide

This guide explains how to test the Sweet Shop Management API endpoints.

## Prerequisites

1. Make sure MongoDB is running locally or you have MongoDB Atlas connection
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   MONGODB_URI=mongodb://localhost:27017/sweetshop
   ```

## Method 1: Automated Tests (Jest)

Run the automated test suite:

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

The tests will:
- Create a test database (`sweetshop_test`)
- Test all endpoints (authentication, sweets CRUD, search, update)
- Clean up after tests complete

## Method 2: Manual Testing with Server

### Step 1: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Step 2: Test Authentication

#### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the token** from the response for next steps.

### Step 3: Test Sweets Endpoints

Replace `YOUR_TOKEN` with the token from login.

#### Get All Sweets
```bash
curl -X GET http://localhost:3000/api/sweets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Create a Sweet
```bash
curl -X POST http://localhost:3000/api/sweets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chocolate Bar",
    "category": "Chocolate",
    "price": 2.50,
    "quantity": 100
  }'
```

#### Search Sweets
```bash
# Search by name
curl -X GET "http://localhost:3000/api/sweets/search?name=chocolate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by category
curl -X GET "http://localhost:3000/api/sweets/search?category=Chocolate" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Search by price range
curl -X GET "http://localhost:3000/api/sweets/search?minPrice=2&maxPrice=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update a Sweet
```bash
# Replace SWEET_ID with actual sweet ID from create response
curl -X PUT http://localhost:3000/api/sweets/SWEET_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Chocolate Bar",
    "price": 3.00
  }'
```

## Method 3: Using Postman or Thunder Client

1. **Import Collection**: Create a new collection in Postman/Thunder Client
2. **Set Base URL**: `http://localhost:3000`
3. **Create Requests**:

### Authentication
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login (save token)

### Sweets
- GET `/api/sweets` - Get all sweets
- POST `/api/sweets` - Create sweet
- GET `/api/sweets/search?name=chocolate` - Search sweets
- PUT `/api/sweets/:id` - Update sweet

4. **Set Authorization**: 
   - Type: Bearer Token
   - Token: (paste token from login response)

## Method 4: Using Browser (for GET requests only)

1. Login first to get token
2. Use browser extensions like "ModHeader" to add Authorization header
3. Visit: `http://localhost:3000/api/sweets`

## Testing Checklist

- [ ] User registration works
- [ ] User login returns JWT token
- [ ] GET /api/sweets requires authentication
- [ ] POST /api/sweets creates new sweet
- [ ] GET /api/sweets/search filters correctly
- [ ] PUT /api/sweets/:id updates sweet
- [ ] Invalid requests return proper error messages
- [ ] Unauthenticated requests are rejected

## Troubleshooting

**Tests fail with MongoDB connection error:**
- Make sure MongoDB is running
- Check MONGODB_URI in test environment

**401 Unauthorized errors:**
- Make sure you're including the Bearer token
- Token might be expired, login again

**404 Not Found:**
- Check if server is running
- Verify the endpoint URL is correct

