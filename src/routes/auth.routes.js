const express = require('express');
const controllerFactory = require('../factories/controller.factory');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();
const userController = controllerFactory.createUserController();

// Public routes
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

module.exports = router;