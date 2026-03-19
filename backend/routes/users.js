const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for creating a new user
 */
const validateNewUser = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Valid email address required'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name')
    .notEmpty().withMessage('First name is required'),
  body('role_id')
    .notEmpty().withMessage('Role is required')
    .isInt().withMessage('Role ID must be a number'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone().withMessage('Valid phone number required')
];

/**
 * Validation middleware for updating a user
 */
const validateUpdateUser = [
  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Valid email address required'),
  body('role_id')
    .optional({ checkFalsy: true })
    .isInt().withMessage('Role ID must be a number'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone().withMessage('Valid phone number required')
];

/**
 * Error handler middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * GET /api/users/me - Get current user profile
 */
router.get('/me', authenticateToken, userController.getCurrentUser);

/**
 * GET /api/users - Get all users (admin/manager only)
 */
router.get(
  '/',
  authenticateToken,
  requireRole('owner', 'manager'),
  userController.getAllUsers
);

/**
 * GET /api/users/:id - Get user by ID (admin/manager only)
 */
router.get(
  '/:id',
  authenticateToken,
  requireRole('owner', 'manager'),
  userController.getUserById
);

/**
 * POST /api/users - Create new user (admin/manager only)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('owner', 'manager'),
  validateNewUser,
  handleValidationErrors,
  userController.createUser
);

/**
 * PUT /api/users/:id - Update user (admin/manager only)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('owner', 'manager'),
  validateUpdateUser,
  handleValidationErrors,
  userController.updateUser
);

/**
 * PUT /api/users/:id/deactivate - Deactivate user (admin only)
 */
router.put(
  '/:id/deactivate',
  authenticateToken,
  requireRole('owner'),
  userController.deactivateUser
);

module.exports = router;
