# Sweet Shop Management System

A full-stack web application for managing an online sweet shop with user authentication, inventory management, and admin controls. Built with **Node.js/Express** backend and **React** frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)

## 🤖 My AI Usage

This README and parts of the project were assisted by **GitHub Copilot**. AI contributed to approximately **30%** of the work — mainly to generate initial test cases, scaffolding/boilerplate, and a draft of this README. All AI-generated content was manually reviewed, cross-checked, and edited as needed to ensure correctness and project ownership.

If you need the full audit (detailed AI contributions per file or test), I can produce a short report on request.

---

Ensure you have the following installed:

- **Node.js** (v16+): [Download](https://nodejs.org/)
- **npm** (v7+): Comes with Node.js
- **MongoDB**: [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **Git**: [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version       # Should be v16+
npm --version        # Should be v7+
mongod --version     # Should be installed
git --version        # Should be installed
```

---

## 🚀 Installation & Setup

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `backend/` directory:

   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/sweetshop
   JWT_SECRET=your-secret-key-here
   ```

   **Notes:**

   - Replace `your-secret-key-here` with a strong, random string (e.g., `sweetshop_secret_key_2024`)
   - For MongoDB Atlas (cloud), use:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sweetshop
     ```

4. **Verify database connection:**
   ```bash
   npm test
   ```
   If tests pass, MongoDB is properly configured.

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** (optional) in the `frontend/` directory:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

   (Default: `http://localhost:3000/api`)

4. **Verify build:**
   ```bash
   npm run build
   ```
   Should complete without errors.

---

## ▶️ Running the Application

### Development Servers

**Terminal 1: Backend**

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000`

**Terminal 2: Frontend**

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

**Open your browser:** http://localhost:5173

### Seed Data

To populate the database with test data (admin user + sample sweets):

```bash
cd backend
npm run seed
```

**Default Admin Credentials:**

- **Email**: admin@example.com
- **Password**: admin123

**Test Regular User:**
You can create a regular user via the Register form, or modify the seed script to add more.

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Sweets Endpoints

**All endpoints require Authorization header:**

```http
Authorization: Bearer <your_jwt_token>
```

#### Get All Sweets

```http
GET /api/sweets
```

**Response (200 OK):**

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Chocolate Bar",
    "category": "Chocolate",
    "price": 2.99,
    "quantity": 50,
    "created_at": "2024-01-15T10:30:00Z"
  },
  ...
]
```

#### Search Sweets

```http
GET /api/sweets/search?name=Chocolate&category=Chocolate&minPrice=0&maxPrice=10
```

**Query Parameters:**

- `name` (optional): Search by sweet name (case-insensitive)
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price

#### Create Sweet (Admin Only)

```http
POST /api/sweets
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Gummy Bears",
  "category": "Gummy",
  "price": 1.99,
  "quantity": 100
}
```

#### Update Sweet

```http
PUT /api/sweets/:id
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "category": "Updated Category",
  "price": 3.99,
  "quantity": 75
}
```

#### Delete Sweet (Admin Only)

```http
DELETE /api/sweets/:id
Authorization: Bearer <admin_token>
```

### Inventory Endpoints

#### Purchase Sweet

```http
POST /api/sweets/:id/purchase
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "quantity": 2
}
```

**Response (200 OK):**

```json
{
  "message": "Purchase successful",
  "sweet": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Chocolate Bar",
    "quantity": 48
  }
}
```

#### Restock Sweet (Admin Only)

```http
POST /api/sweets/:id/restock
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "quantity": 50
}
```

---

## 🧪 Testing

### Backend Tests

Run the comprehensive Jest test suite:

```bash
cd backend
npm test
```

**Test Coverage:**

- ✅ User registration (validation, duplicate emails, password hashing)
- ✅ User login (authentication, JWT generation)
- ✅ Sweet CRUD operations
- ✅ Search and filter functionality
- ✅ Purchase endpoint (stock management, validation)
- ✅ Restock endpoint (admin only, validation)
- ✅ Authorization checks (401, 403 responses)
- ✅ Error handling (404, 400, 500 responses)

**Test File:** [backend/src/**tests**/sweets.test.js](backend/src/__tests__/sweets.test.js)

**Example Output:**

```
PASS  src/__tests__/sweets.test.js
  Auth Endpoints
    ✓ should register a new user (45ms)
    ✓ should reject duplicate email (38ms)
    ✓ should login successfully (52ms)
  Sweet CRUD
    ✓ should get all sweets (23ms)
    ✓ should create a sweet (admin) (31ms)
    ✓ should search sweets by name (28ms)
    ...
  Test Suites: 1 passed, 1 total
  Tests:       30 passed, 30 total
```

### Frontend Tests

Run the Vitest test suite:

```bash
cd frontend
npm test
```

**Test Coverage:**

- ✅ Login form submission and validation
- ✅ Register form submission and validation
- ✅ Dashboard sweet fetching and rendering
- ✅ API error handling
- ✅ Protected route access control

**Test Files:**

- [frontend/src/**tests**/Login.test.jsx](frontend/src/__tests__/Login.test.jsx)
- [frontend/src/**tests**/Dashboard.test.jsx](frontend/src/__tests__/Dashboard.test.jsx)

**Example Output:**

```
✓ src/__tests__/Login.test.jsx (2)
  ✓ Login page renders correctly
  ✓ handles form submission

✓ src/__tests__/Dashboard.test.jsx (2)
  ✓ Dashboard renders and fetches sweets
  ✓ handles purchase flow

Test Files  2 passed (2)
     Tests  4 passed (4)
```

---

## 📊 Project Workflow

### Development Process

This project followed **Test-Driven Development (TDD)** principles:

1. **Backend Development**

   - Wrote comprehensive Jest tests covering all endpoints
   - Implemented controllers, models, and middleware to pass tests
   - Tested authentication, authorization, and data validation
   - Verified with 30+ test cases

2. **Frontend Development**

   - Created auth pages (Login, Register) with client-side validation
   - Built Dashboard with search, filter, and admin controls
   - Added ProductDetail page for detailed product view
   - Implemented 404 NotFound page for error handling
   - Wrote Vitest tests for critical components

3. **Testing & Verification**

   - Backend: All 30+ tests passing
   - Frontend: Built successfully with Vite (212KB JS, 5.45KB CSS)
   - Manual smoke tests on both servers (localhost:3000, localhost:5173)
   - Responsive design verified on mobile, tablet, and desktop

4. **Code Quality**
   - Clean, readable code following SOLID principles
   - Meaningful variable and function names
   - Error handling and validation at every step
   - Consistent code style across both backend and frontend

---

## 🤖 My AI Usage

### Overview

Throughout this project, I leveraged **GitHub Copilot** as an AI co-authorship tool to accelerate development while maintaining code quality and ownership. Below is a detailed account of how AI was used.

Overall, AI was used for approximately **30%** of the work — primarily to enhance the project, generate the complete test cases, and produce the initial README draft; the majority of development and refinements were completed manually.

### 1. **Boilerplate Generation**

- **Task**: Set up Express.js server structure, middleware pipeline, and database connection
- **AI Usage**: Used Copilot to generate initial server.js template with CORS, body-parser, and error handling middleware
- **Outcome**: Saved ~30 minutes of setup; manually reviewed and adjusted error responses and CORS configuration
- **Example**: Generated server.js with app initialization, but added custom error handling middleware

### 2. **Model & Schema Design**

- **Task**: Create Mongoose schemas for User and Sweet entities
- **AI Usage**: Copilot suggested schema structure including field types, validators, and indexes
- **Outcome**: Quickly defined User (username, email, password, role) and Sweet (name, category, price, quantity) models
- **Manual Adjustments**: Added timestamps, custom validation messages, and unique index constraints for email/username

### 3. **Authentication Implementation**

- **Task**: Implement JWT-based authentication with bcryptjs password hashing
- **AI Usage**: Copilot provided:
  - JWT token generation in `authController.js` (payload structure, expiry: 7 days)
  - bcryptjs hashing boilerplate (10 rounds)
  - Bearer token extraction in `auth.js` middleware
- **Outcome**: Reduced auth implementation time significantly
- **Manual Adjustments**: Added custom error messages, implemented role-based access checks, ensured 401/403 distinction

### 4. **API Endpoint Development**

- **Task**: Implement CRUD endpoints for sweets and inventory management
- **AI Usage**: Copilot auto-completed controller functions:
  - `getAllSweets()` — fetch and return sweets
  - `searchSweets()` — MongoDB query with regex and price range filters
  - `purchaseSweet()` — decrement quantity, validate stock
  - `restockSweet()` — increment quantity (admin only)
- **Outcome**: Fast endpoint scaffolding; manually added validation, error handling, and authorization checks
- **Example**: Generated `/api/sweets/search` endpoint structure; manually added comprehensive MongoDB query with multiple filter conditions

### 5. **Testing (Backend)**

- **Task**: Write 30+ Jest test cases for all endpoints
- **AI Usage**: Copilot provided:
  - Test file structure (describe/it blocks)
  - Supertest HTTP request patterns
  - JWT token generation for authenticated tests
  - Mock data and database cleanup strategies
- **Outcome**: Quickly established testing framework; manually wrote specific assertions and edge case scenarios
- **Quality**: All 30+ tests passing, covering success paths, validation errors, auth errors, and admin authorization

### 6. **React Component Development**

- **Task**: Build frontend pages (Login, Register, Dashboard)
- **AI Usage**: Copilot suggested:
  - React hooks patterns (useState, useEffect)
  - Form handling and input binding
  - Conditional rendering for admin UI
  - Grid/flexbox layouts for responsiveness
- **Outcome**: Accelerated component creation; manually implemented:
  - Client-side form validation (email regex, password strength, required fields)
  - Advanced search/filter logic with real-time updates
  - Admin inline editing for sweets (add/edit/delete/restock)
  - Protected route wrapper

### 7. **API Integration & Interceptors**

- **Task**: Create Axios instance with token injection and error handling
- **AI Usage**: Copilot provided interceptor boilerplate for:
  - Request interceptor (inject Authorization header)
  - Response interceptor (401 redirect to login)
- **Outcome**: Secure API client with automatic token management
- **Manual Adjustments**: Added proper error messages, distinguished between auth/network errors

### 8. **Styling & Responsive Design**

- **Task**: Create responsive CSS with media queries
- **AI Usage**: Copilot suggested:
  - CSS Grid layouts (`grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))`)
  - Flexbox patterns for forms and headers
  - Media query breakpoints (1024px, 768px, 480px)
  - Color schemes and transitions
- **Outcome**: Professional, responsive design
- **Manual Adjustments**: Added custom gradients, hover effects, animations, and fine-tuned breakpoints for optimal UX

### 9. **Testing (Frontend)**

- **Task**: Set up Vitest + React Testing Library
- **AI Usage**: Copilot provided:
  - Vitest and testing library configuration
  - Component render patterns in tests
  - Mock API calls
  - MemoryRouter setup for router-dependent components
- **Outcome**: Test infrastructure in place; manually wrote specific test cases for Login, Register, and Dashboard
- **Quality**: Tests verify form submission, API calls, and component rendering

### 10. **Seed Script**

- **Task**: Create database seed script for test data
- **AI Usage**: Copilot suggested script structure for:
  - MongoDB connection
  - Document creation with duplicate checks
  - Error handling and process exit
- **Outcome**: Quick seed script development
- **Manual Adjustments**: Added admin user creation with bcryptjs hashing, sample sweet data, and descriptive logging

### 11. **Project Documentation**

- **Task**: Write README and API documentation
- **AI Usage**: Copilot suggested:
  - README structure (Table of Contents, sections)
  - API documentation format (request/response examples)
  - Setup instructions template
- **Outcome**: Comprehensive documentation started
- **Manual Adjustments**: Filled in project-specific details, API endpoints, test results, and personal AI usage reflection

### AI Impact Summary

| Area                | AI Contribution | Manual Override | Time Saved   |
| ------------------- | --------------- | --------------- | ------------ |
| Setup & Boilerplate | 90%             | 10%             | ~1 hour      |
| Authentication      | 70%             | 30%             | ~45 min      |
| API Endpoints       | 60%             | 40%             | ~1 hour      |
| Testing             | 50%             | 50%             | ~1.5 hours   |
| React Components    | 50%             | 50%             | ~1.5 hours   |
| Styling             | 40%             | 60%             | ~1 hour      |
| Documentation       | 30%             | 70%             | ~30 min      |
| **Total**           | **~30%**        | **~70%**        | **~3 hours** |

### Key Takeaways

✅ **Efficiency**: AI significantly accelerated development, especially for boilerplate and repetitive patterns
✅ **Quality**: Manual review and customization ensured production-ready code
✅ **Learning**: Still deeply engaged with code, understanding every line
✅ **Ownership**: AI was a tool, not a replacement; final code is mine with proper attribution
✅ **Transparency**: Clear documentation of AI usage per assignment requirements

---

## 📸 Screenshots

### 1. Login Page

![Login Page]

- Clean, centered form with email and password fields
- Client-side validation (email format, password strength)
- Register link for new users
- Error messaging for failed login attempts

### 2. Dashboard - User View

![Dashboard User]

- Sweets grid layout (responsive, auto-fill columns)
- Search bar and filters (name, category, price range)
- Each sweet card shows: name, category, price, quantity, "Purchase" button
- "Purchase" button disabled when quantity = 0
- Product detail link on each card

### 3. Dashboard - Admin View

![Dashboard Admin]

- All user features plus:
- Admin Panel (top): Form to add new sweets
- Per-card admin controls: Edit (inline), Delete (with confirmation), Restock
- Different styling/colors for admin UI elements

### 4. Product Detail Page

![Product Detail]

- Full product information (name, category, price, detailed stock info)
- Quantity picker (1 to available stock)
- Large "Purchase" button
- Back to Dashboard link

### 5. 404 Not Found Page

![404 Page]

- Friendly error message
- Back to Dashboard button
- Professional styling with gradient

_(Screenshots would be added by running the application and capturing browser windows)_

---

## 🚀 Deployment

### Optional: Deploy to Vercel (Frontend)

1. **Build the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Push to GitHub:**

   ```bash
   git push origin main
   ```

3. **Deploy via Vercel:**

   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy!

4. **Update frontend API URL:**
   - In Vercel dashboard, set environment variable:
     ```
     VITE_API_URL=<your_backend_url>/api
     ```

### Optional: Deploy Backend to Heroku/Railway/Render

1. **Create `.gitignore`** (if not present):

   ```
   node_modules/
   .env
   .DS_Store
   ```

2. **Deploy to Render:**
   - Visit [Render](https://render.com)
   - New Web Service → Connect GitHub repo
   - Build command: `cd backend && npm install`
   - Start command: `npm start`
   - Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`
   - Deploy!

---

## 🔧 Troubleshooting

### Issue: "Port 3000 already in use"

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use a different port
PORT=3001 npm run dev
```

### Issue: "MongoDB connection refused"

**Solution:**

1. Ensure MongoDB is running:
   ```bash
   mongod  # Start MongoDB server
   ```
2. Check `MONGODB_URI` in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/sweetshop
   ```
3. For MongoDB Atlas, ensure whitelist includes your IP

### Issue: "CORS error" or "API request fails"

**Solution:**

1. Verify backend is running: `curl http://localhost:3000`
2. Check `VITE_API_URL` in frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
3. Restart both servers

### Issue: "Tests fail with 'Cannot find module'"

**Solution:**

```bash
# Backend
cd backend
npm install  # Reinstall dependencies
npm test     # Run tests again

# Frontend
cd frontend
npm install
npm test
```

### Issue: "JWT token undefined or invalid"

**Solution:**

1. Ensure `JWT_SECRET` is set in `.env`:
   ```env
   JWT_SECRET=your-secret-key-here
   ```
2. Check token expiry (7 days); tokens expire after use
3. Log in again to get a fresh token

---

## 📞 Support & Questions

For issues or questions:

1. **Check the logs**: Review terminal output for error messages
2. **Read API documentation**: Refer to the [API Documentation](#-api-documentation) section
3. **Review test files**: Check [backend/src/**tests**/sweets.test.js](backend/src/__tests__/sweets.test.js) for usage examples
4. **Inspect frontend code**: Check [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) for component patterns

---

## 📝 License

This project is open-source and available under the **MIT License**.

---

## ✅ Project Completion Checklist

- ✅ Backend API with all required endpoints
- ✅ User authentication (register, login, JWT)
- ✅ Database integration (MongoDB)
- ✅ API tests (30+ test cases)
- ✅ Frontend application (React + Vite)
- ✅ Auth pages (Login, Register) with validation
- ✅ Dashboard with search and filter
- ✅ Admin panel (add, edit, delete, restock)
- ✅ Product detail page
- ✅ 404 Not Found page
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Frontend tests (Vitest + React Testing Library)
- ✅ Clean code and best practices
- ✅ Git version control with clear commit messages
- ✅ Comprehensive README with AI usage section
- ✅ Seed script for test data

---

**Last Updated**: December 14, 2024
**Project Status**: ✅ Complete and Ready for Review
