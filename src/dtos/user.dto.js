class UserDTO {
  constructor(user, token) {
    this.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    this.token = token;
  }

  static fromRegister(user) {
    return new UserDTO(user, null);
  }

  static fromLogin(user, token) {
    return new UserDTO(user, token);
  }

  toJSON() {
    return {
      user: this.user,
      token: this.token
    };
  }
}

module.exports = UserDTO; 