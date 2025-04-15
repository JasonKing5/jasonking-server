const express = require('express');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/', auth, adminAuth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/', auth, userController.updateUser);
router.post('/', auth, adminAuth, userController.createUser);
router.delete('/:id', auth, adminAuth, userController.deleteUser);

module.exports = router;
