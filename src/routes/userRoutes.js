const express = require('express');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/auth/register', userController.register);
router.post('/auth/login', userController.login);

// Protected routes
router.get('/users', auth, adminAuth, userController.getAllUsers);
router.put('/users/:id', auth, userController.updateUser);
router.delete('/users/:id', auth, adminAuth, userController.deleteUser);

module.exports = router;
