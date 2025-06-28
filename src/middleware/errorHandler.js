const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  const error = {
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  };

  // TypeORM errors
  if (err.name === "QueryFailedError") {
    error.message = "Database query failed";
    error.status = 400;
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.message = "Validation failed";
    error.status = 400;
  }

  // Redis errors
  if (err.message && err.message.includes("Redis")) {
    error.message = "Cache service temporarily unavailable";
    error.status = 503;
  }

  if (process.env.NODE_ENV === "production") {
    delete err.stack;
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
