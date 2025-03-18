const jwt = require('jsonwebtoken');

class UserController {
  constructor(userService) {
    this._userService = userService;
  }

  async register(req, res) {
    try {
      const result = await this._userService.register(req.body);
      res.status(201).json(result);
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
      const result = await this._userService.login(email, password);
      res.json(result);
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