const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const { AppDataSource } = require("./config/database");
const { redisClient } = require("./config/redis");
const swaggerSpec = require("./config/swagger");
const bookRoutes = require("./routes/books");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/books", bookRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "Connected" : "Disconnected",
    redis: redisClient.isReady ? "Connected" : "Disconnected",
  });
});

app.use(errorHandler);
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// starting server
const startServer = async () => {
  try {
    // initialize database
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // initialize Redis
    await redisClient.connect();
    console.log("Redis connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `API Documentation available at http://localhost:${PORT}/docs`
      );
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await AppDataSource.destroy();
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await AppDataSource.destroy();
  await redisClient.quit();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
