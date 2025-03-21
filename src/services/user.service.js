const userRepository = require('../repositories/user.repository');
const jwt = require('jsonwebtoken');

class UserService {
  constructor() {
    if (UserService.instance) {
      return UserService.instance;
    }
    UserService.instance = this;
    this._userRepository = userRepository;
  }

  static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async register(userData) {
    const { email, password, name } = userData;

    // Check if user already exists
    const exists = await this._userRepository.exists(email);
    if (exists) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = await this._userRepository.create({
      email,
      password, // Password will be hashed by the model's pre-save hook
      name
    });

    return {
      user,
    };
  }

  async login(email, password) {
    // Find user by email
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    };
  }
}

module.exports = UserService.getInstance();