class GenericResponseDTO {
  constructor(message, isSuccess) {
    this.message = message;
    this.isSuccess = isSuccess;
  }

  static fromGeneric(message, isSuccess) {
    return new GenericResponseDTO(message, isSuccess);
  }

}

module.exports = GenericResponseDTO;  