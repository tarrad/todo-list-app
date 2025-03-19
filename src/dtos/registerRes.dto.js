class RegisterResponseDTO {
  constructor(isSuccess, error) {
    this.isSuccess = isSuccess;
    this.error = error;
  }

  static fromRegister(isSuccess, error) {
    return new RegisterResponseDTO(isSuccess, error);
  }

}

module.exports = RegisterResponseDTO;  