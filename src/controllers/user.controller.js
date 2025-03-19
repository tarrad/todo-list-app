const UserLoginDTO = require('../dtos/user.dto');
const RegisterResponseDTO = require('../dtos/registerRes.dto');

class UserController {
  constructor(userService) {
    if (UserController.instance) {
      return UserController.instance;
    }
    UserController.instance = this;
    this._userService = userService;
  }

  static getInstance(userService) {
    if (!UserController.instance) {
      UserController.instance = new UserController(userService);
    }
    return UserController.instance;
  }

  async register(req, res) {
    try {
      const user = await this._userService.register(req.body);
      if(user)
      {
        const response = RegisterResponseDTO.fromRegister(true, null);
        res.json(response);
      }
      else
      {
        const response = RegisterResponseDTO.fromRegister(false, 'Failed to register user');
        res.status(500).json(response);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'User already exists') {
        return res.status(400).json(RegisterResponseDTO.fromRegister(false, error.message));
      }
      res.status(500).json(RegisterResponseDTO.fromRegister(false, 'Failed to register user'));
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await this._userService.login(email, password);
      const response = UserLoginDTO.fromLogin(user, token, null);
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Invalid credentials') {
        return res.status(401).json(UserLoginDTO.fromLogin(null, null, error.message));
      }
      res.status(500).json(UserLoginDTO.fromLogin(null, null, 'Failed to login'));
    }
  }
}

module.exports = UserController; 