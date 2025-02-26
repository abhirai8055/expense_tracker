# Expense Tracker API

An Expense Tracker API built with **Node.js**, **Express**, and **MongoDB**. This API allows users to log, manage, and retrieve their expenses. It also includes features like user authentication, category management, and expense filtering.

---

## **Features**

1. **User Authentication**:
   - User registration and login with JWT-based authentication.
   - OTP verification for user registration.

2. **Category Management**:
   - Create, update, delete, and fetch categories.
   - Associate expenses with categories.

3. **Expense Management**:
   - Log, update, delete, and fetch expenses.
   - Filter expenses by date, category, or amount.
   - Get a summary of total expenses for a specific month.

4. **Admin Features**:
   - Admin can manage users and categories.

---

## **Technologies Used**

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **API Testing**: Postman

---

## **API Documentation**

The API documentation is available in the `docs` folder. It includes a Postman collection for testing all the endpoints.

---

## **Setup Guide**

### **Prerequisites**

1. **Node.js**: Install Node.js from [here](https://nodejs.org/).
2. **MongoDB**: Install MongoDB from [here](https://www.mongodb.com/).
3. **Git**: Install Git from [here](https://git-scm.com/).

### **Steps to Run the Project**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/abhirai8055/expense_tracker.git
   cd expense_tracker


              # Set Up Environment Variables:
 # Server Configuration
PORT

# Database Configuration
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=

# JWT Configuration
JWT_SECRET=
JWT_EXPIRES_IN=

# Nodemailer Configuration
EMAIL_USER=
EMAIL_PASSWORD=
