# BetaVersion - eCommerce RESTful API

## Overview

**The eCommerce beta version** is a robust and secure RESTful API designed for real-world eCommerce applications. Built using Node.js, Express.js, MongoDB, and Mongoose, it integrates modern security and performance practices to meet the demands of scalable eCommerce platforms.

## Features

- **User Management**:

  - Secure user registration and login with **JWT-based authentication**.
  - Role-based access control for admin and regular users.

- **Product and Category Management**:

  - Full CRUD operations for products and categories.
  - Structured API routes for easy integration with front-end platforms.

- **Order Processing**:

  - Create and manage customer orders.
  - Flexible design for future payment integrations.

- **Enhanced Security**:

  - Input sanitization to prevent SQL injection and XSS attacks.
  - Middleware for MongoDB query sanitization, HTTP parameter pollution prevention, and CORS.

- **Performance Optimization**:

  - Request compression using **compression** middleware.
  - Rate limiting for preventing abuse and DoS attacks.

- **Error Handling**:
  - Centralized error handling with meaningful HTTP status codes.

## Key Packages Used

The application integrates several packages to ensure reliability, security, and efficiency:

### Core Middleware

- **express**: Server framework for building RESTful APIs.
- **morgan**: HTTP request logging for monitoring API activity.
- **rateLimit**: Rate limiting to control the number of requests and prevent abuse.
- **helmet**: Security middleware for HTTP headers.
- **express-mongo-sanitize**: Prevents NoSQL query injection attacks.
- **hpp**: Protects against HTTP parameter pollution.
- **cors**: Enables cross-origin resource sharing for secure client-server communication.
- **compression**: Compresses responses for faster data transfer.

### Custom Middleware

- **sanitizeInput**: Ensures all user input is cleaned and validated before processing.

### Routes

- **productRouter**: Manages all product-related operations.
- **categoryRouter**: Handles CRUD operations for categories.
- **userRouter**: Manages user authentication and profile operations.

### Controllers

- **errorController**: Centralized error handling for API endpoints.

## Installation

### Prerequisites

Ensure the following are installed on your system:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Mos3aB696/betaVersion.git
   cd betaVersion
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:  
   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=5000
   MONGO_URI=<your-mongo-database-connection-string>
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRES_IN=90d
   ```

4. Run the application:

   ```bash
   npm start
   ```

5. API is accessible at:  
   `http://localhost:5000`

---

## API Endpoints

### Products

| Method | Endpoint                                | Description          | Authentication |
| ------ | --------------------------------------- | -------------------- | -------------- |
| GET    | `/eCommerce_v1/products/All_Products`   | Get all products     | No             |
| GET    | `/eCommerce_v1/products/Get_Product`    | Get product by ID    | No             |
| POST   | `/eCommerce_v1/products/Create_Product` | Create a new product | Yes (Admin)    |
| PATCH  | `/eCommerce_v1/products/Update_Product` | Update product       | Yes (Admin)    |
| DELETE | `/eCommerce_v1/products/Delete_Product` | Delete product       | Yes (Admin)    |

### Users

| Method | Endpoint                          | Description    | Authentication |
| ------ | --------------------------------- | -------------- | -------------- |
| GET    | `/eCommerce_v1/users/All_Users`   | Get all users  | Yes (Admin)    |
| GET    | `/eCommerce_v1/users/Get_User`    | Get user by ID | Yes            |
| PATCH  | `/eCommerce_v1/users/Update_User` | Update user    | Yes            |
| DELETE | `/eCommerce_v1/users/Delete_User` | Delete user    | Yes            |

### Authentication

| Method | Endpoint                                  | Description                   | Authentication |
| ------ | ----------------------------------------- | ----------------------------- | -------------- |
| POST   | `/eCommerce_v1/Auth/SignUp`               | User registration             | No             |
| PATCH  | `/eCommerce_v1/Auth/verifyEmail`          | Verify user email             | No             |
| POST   | `/eCommerce_v1/Auth/Login`                | User login                    | No             |
| POST   | `/eCommerce_v1/Auth/forgotPassword`       | Forgot password               | No             |
| PATCH  | `/eCommerce_v1/Auth/resetPassword`        | Reset password                | No             |
| PATCH  | `/eCommerce_v1/Auth/updatePassword`       | Update password (logged in)   | Yes            |
| PATCH  | `/eCommerce_v1/Auth/regenerateEmailToken` | Regenerate verification token | No             |

### Categories

| Method | Endpoint                                  | Description           | Authentication |
| ------ | ----------------------------------------- | --------------------- | -------------- |
| GET    | `/eCommerce_v1/categories/All_Categories` | Get all categories    | No             |
| GET    | `/eCommerce_v1/categories/Get_Category`   | Get category by ID    | No             |
| POST   | `/eCommerce_v1/categories/createCategory` | Create a new category | Yes (Admin)    |
| PATCH  | `/eCommerce_v1/categories/updateCategory` | Update category       | Yes (Admin)    |
| DELETE | `/eCommerce_v1/categories/deleteCategory` | Delete category       | Yes (Admin)    |

---

## Project Structure

```
betaVersion/
├── client/                # Frontend files
├── server/
│   ├── controllers/       # Contains the logic for handling requests
│   ├── middlewares/       # Custom middleware for validation and security
│   ├── models/            # Mongoose models for MongoDB collections
│   ├── routers/           # API route handlers
│   ├── utils/             # Utility functions and helpers
├── node_modules/          # Installed dependencies
├── .env                   # Environment variables
├── .prettierrc            # Prettier configuration
├── eslint.config.js       # ESLint configuration
├── important.todo         # Notes and important tasks
├── index.js               # Main entry point
├── package-lock.json      # Dependency lock file
├── package.json           # Project metadata and dependencies
├── server.js              # Server configuration
├── .gitignore             # Git ignored files
├── eCommerce.code-workspace # VS Code workspace settings
└── README.md              # Project documentation

```

## Contribution

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## Contact

For any questions or support, feel free to reach out:

**Mosaab Abdelkawy**

- [LinkedIn](https://www.linkedin.com/in/mosaab-abdelkawy/)
- [YouTube](https://youtube.com/@tapseta696?si=7q1LRJdUoOW2Yamk)

---
