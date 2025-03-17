class BaseController {
  constructor() {
    if (this.constructor === BaseController) {
      throw new Error('BaseController is abstract and cannot be instantiated');
    }
  }

  // Common response methods
  ok(data) {
    return {
      success: true,
      data
    };
  }

  error(message, code = 500) {
    return {
      success: false,
      error: {
        message,
        code
      }
    };
  }

  // Common error handling
  handleError(error) {
    console.error('Error:', error);
    return this.error(error.message || 'Internal server error');
  }
}

module.exports = BaseController; 