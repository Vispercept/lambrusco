class ValidationError extends Error {
  constructor(error) {
    super(error);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}


module.exports = {
  ValidationError,
  isValidationError: (err) => err.constructor === ValidationError,
};
