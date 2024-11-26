/**
 * Custom error class for application-specific errors.
 */
class AppError extends Error {
  /**
   * Creates an instance of AppError.
   */
  constructor() {
    super();
  }

  /**
   * Creates an error instance with the given status code, status message, and message.
   * @param {number} statusCode - The status code of the error.
   * @param {string} statusMsg - The status message of the error.
   * @param {string} message - The error message.
   * @returns {AppError} The created error instance.
   */
  create(statusCode, statusMsg, message) {
    this.statusCode = statusCode;
    this.statusMsg = statusMsg;
    this.message = message;
    return this;
  }
}

export default new AppError();
