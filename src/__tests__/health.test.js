const request = require("supertest");
const { AppDataSource } = require("../config/database");
const { redisClient } = require("../config/redis");
const app = require("../server");

describe("Health Check", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    try {
      await redisClient.connect();
    } catch (error) {
      console.warn("Redis not available for tests");
    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    if (redisClient.isReady) {
      await redisClient.quit();
    }
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("database");
      expect(response.body).toHaveProperty("redis");
    });
  });

  describe("404 Handler", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app)
        .get("/non-existent-route")
        .expect(404);

      expect(response.body.error).toBe("Route not found");
    });
  });
});
