const jwt = require('jsonwebtoken');

class UserController {
  constructor(userRepository) {
    this._userRepository = userRepository;
  }

  async register(req, res) {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const exists = await this._userRepository.exists(email);
      if (exists) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create new user
      const user = await this._userRepository.create({
        email,
        password // Password will be hashed by the model's pre-save hook
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
}

module.exports = UserController; 