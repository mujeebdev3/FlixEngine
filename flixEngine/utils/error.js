class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message || "Bad Request", 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || "Unauthorized", 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message || "Forbidden", 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message || "Not Found", 404);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message || "Conflict", 409);
  }
}

class InternalServerError extends AppError {
  constructor(message, errorCode = "INTERNAL_SERVER_ERROR") {
    super(
      message || "Something went wrong on our end. Please try again later.",
      500,
      false,
      errorCode
    );
  }
}

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
};
