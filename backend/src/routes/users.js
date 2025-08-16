const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');

const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange
} = require('../middleware/validation');

const {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin
} = require('../utils/jwt');

// Public routes
router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);

// Protected routes - require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', validateUserUpdate, updateUserProfile);
router.put('/change-password', validatePasswordChange, changePassword);

// Admin only routes
router.get('/', requireAdmin, getAllUsers);
router.get('/:id', requireAdmin, getUserById);
router.put('/:id/role', requireAdmin, updateUserRole);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;