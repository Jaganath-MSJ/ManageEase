# ManageEase

ManageEase is a full-stack application for managing users and tasks with role-based access control. It provides a user-friendly interface for user registration, login, profile management, and task management.

## Features

- User authentication (register, login, logout)
- Role-based access control (Admin and Regular User)
- User profile management
- Task management with filtering, sorting, and search
- Responsive UI

## Tech Stack

### Frontend

- React with Vite
- React Router for navigation
- Formik and Yup for form validation
- Axios for API requests
- React Toastify for notifications

### Backend

- Node.js with Express
- MongoDB for data persistence
- JWT for authentication
- Bcrypt for password hashing
- Express Validator for input validation

## Project Structure

manageease/
├── frontend/ # React frontend
│ ├── public/ # Static files
│ ├── src/ # Source files
│ │ ├── components/ # Reusable components
│ │ ├── context/ # Context providers
│ │ ├── pages/ # Page components
│ │ ├── App.jsx # Main App component
│ │ └── main.jsx # Entry point
│ ├── .env.example # Example environment variables
│ └── package.json # Frontend dependencies
├── backend/ # Node.js backend
│ ├── middleware/ # Express middleware
│ ├── models/ # Mongoose models
│ ├── routes/ # API routes
│ ├── .env.example # Example environment variables
│ ├── package.json # Backend dependencies
│ └── server.js # Entry point
└── README.md

# Project documentation

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your local configuration
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
