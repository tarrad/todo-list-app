class UserLoginDTO {
  constructor(user, token, error) {
    this.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    this.token = token;
    this.error = error;
  }


  static fromLogin(user, token, error) {
    return new UserLoginDTO(user, token, error);
  }

  toJSON() {
    return {
      user: this.user,
      token: this.token
    };
  }
}

module.exports = UserLoginDTO; 