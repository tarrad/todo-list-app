const express = require('express');
const controllerFactory = require('../factories/controller.factory');
const { authenticateToken } = require('../middleware/auth.middleware');
const userRepository = require('../repositories/user.repository');

const router = express.Router();
const userController = controllerFactory.createUserController(userRepository);

// Public routes
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));


module.exports = router; 