class AppError extends Error {
  constructor() {
    super();
  }
  create(statusCode, statusMsg, message) {
    this.statusCode = statusCode;
    this.statusMsg = statusMsg;
    this.message = message;
    return this;
  }
}

export default new AppError();
