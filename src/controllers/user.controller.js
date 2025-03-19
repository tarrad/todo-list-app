const jwt = require('jsonwebtoken');
const UserDTO = require('../dtos/user.dto');

class UserController {
  constructor(userService) {
    this._userService = userService;
  }

  async register(req, res) {
    try {
      const user = await this._userService.register(req.body);
      const response = UserDTO.fromRegister(user);
      res.status(201).json(response.toJSON());
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'User already exists') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await this._userService.login(email, password);
      const response = UserDTO.fromLogin(user, token);
      res.json(response.toJSON());
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to login' });
    }
  }
}

module.exports = UserController; 