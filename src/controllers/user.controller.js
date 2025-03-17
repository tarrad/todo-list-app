const BaseController = require('./base.controller');
const jwt = require('jsonwebtoken');

class UserController extends BaseController {
  constructor(userRepository) {
    super();
    this._userRepository = userRepository;
  }

  // POST /api/auth/register
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Basic validation
      if (!email || !password || !name) {
        return res.status(400).json(
          this.error('Email, password and name are required', 400)
        );
      }

      // Check if email already exists
      const existingUser = await this._userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json(
          this.error('Email already registered', 400)
        );
      }

      // Create new user
      const user = await this._userRepository.create({
        email,
        password,
        name
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json(
        this.ok({
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        })
      );
    } catch (error) {
      return res.status(400).json(this.handleError(error));
    }
  }

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        return res.status(400).json(
          this.error('Email and password are required', 400)
        );
      }

      // Find user and include password field
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json(
          this.error('Invalid email or password', 401)
        );
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json(
          this.error('Invalid email or password', 401)
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json(
        this.ok({
          user: {
            id: user._id,
            email: user.email,
            name: user.name
          },
          token
        })
      );
    } catch (error) {
      return res.status(400).json(this.handleError(error));
    }
  }

  
}

module.exports = UserController; 