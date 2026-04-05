# Payroll Backend

This is the Node.js Express backend for the Task Payroll application.

## Setup

1.  Make sure you have [MongoDB](https://www.mongodb.com/try/download/community) installed and running.
2.  Navigate to this directory: `cd task-payroll-final/backend`
3.  Install dependencies: `npm install`
4.  Create a `.env` file (one has been created for you) and update `MONGO_URI` if necessary.
5.  Start the server: `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/register` - Create a new account
- `POST /api/auth/login` - Login to an existing account

## Technologies Used
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)
- Bcryptjs (Password Hashing)
