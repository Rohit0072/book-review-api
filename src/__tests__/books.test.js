const request = require("supertest");
const { AppDataSource } = require("../config/database");
const { redisClient } = require("../config/redis");
const app = require("../server");

describe("Books API", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    // Try to connect to Redis
    try {
      await redisClient.connect();
    } catch (error) {
      console.warn("Redis not available for tests, continuing without cache");
    }
  });

  afterAll(async () => {
    await AppDataSource.destroy();
    if (redisClient.isReady) {
      await redisClient.quit();
    }
  });

  beforeEach(async () => {
    await AppDataSource.synchronize(true);
    if (redisClient.isReady) {
      await redisClient.flushAll();
    }
  });

  describe("GET /books", () => {
    it("should return empty array when no books exist", async () => {
      const response = await request(app).get("/books").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return books with reviews", async () => {
      const bookResponse = await request(app)
        .post("/books")
        .send({
          title: "Test Book",
          author: "Test Author",
        })
        .expect(201);

      const bookId = bookResponse.body.id;

      await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          comment: "Great book!",
          rating: 5,
        })
        .expect(201);

      // Get all books
      const response = await request(app).get("/books").expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        title: "Test Book",
        author: "Test Author",
      });
      expect(response.body[0].reviews).toHaveLength(1);
      expect(response.body[0].reviews[0]).toMatchObject({
        comment: "Great book!",
        rating: 5,
      });
    });
  });

  describe("POST /books", () => {
    it("should create a new book", async () => {
      const bookData = {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
      };

      const response = await request(app)
        .post("/books")
        .send(bookData)
        .expect(201);

      expect(response.body).toMatchObject(bookData);
      expect(response.body.id).toBeDefined();
    });

    it("should return 400 when title is missing", async () => {
      const response = await request(app)
        .post("/books")
        .send({
          author: "Test Author",
        })
        .expect(400);

      expect(response.body.error).toBe("Title and author are required");
    });

    it("should return 400 when author is missing", async () => {
      const response = await request(app)
        .post("/books")
        .send({
          title: "Test Book",
        })
        .expect(400);

      expect(response.body.error).toBe("Title and author are required");
    });

    it("should return 400 when title is empty", async () => {
      const response = await request(app)
        .post("/books")
        .send({
          title: "   ",
          author: "Test Author",
        })
        .expect(400);

      expect(response.body.error).toBe("Title and author cannot be empty");
    });

    it("should return 400 when book already exists", async () => {
      const bookData = {
        title: "Duplicate Book",
        author: "Test Author",
      };

      // Create first book
      await request(app).post("/books").send(bookData).expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post("/books")
        .send(bookData)
        .expect(400);

      expect(response.body.error).toBe(
        "Book with this title and author already exists"
      );
    });
  });

  describe("GET /books/:id/reviews", () => {
    it("should return reviews for a book", async () => {
      // Create a book
      const bookResponse = await request(app)
        .post("/books")
        .send({
          title: "Test Book",
          author: "Test Author",
        })
        .expect(201);

      const bookId = bookResponse.body.id;

      // Add reviews
      await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          comment: "Great book!",
          rating: 5,
        })
        .expect(201);

      await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          comment: "Good read",
          rating: 4,
        })
        .expect(201);

      // Get reviews
      const response = await request(app)
        .get(`/books/${bookId}/reviews`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        comment: "Great book!",
        rating: 5,
      });
      expect(response.body[1]).toMatchObject({
        comment: "Good read",
        rating: 4,
      });
    });

    it("should return 404 for non-existent book", async () => {
      const response = await request(app).get("/books/999/reviews").expect(404);

      expect(response.body.error).toBe("Book not found");
    });

    it("should return 400 for invalid book ID", async () => {
      const response = await request(app)
        .get("/books/invalid/reviews")
        .expect(400);

      expect(response.body.error).toBe("Invalid book ID");
    });
  });

  describe("POST /books/:id/reviews", () => {
    let bookId;

    beforeEach(async () => {
      // Create a book for testing reviews
      const bookResponse = await request(app)
        .post("/books")
        .send({
          title: "Test Book",
          author: "Test Author",
        })
        .expect(201);

      bookId = bookResponse.body.id;
    });

    it("should create a new review", async () => {
      const reviewData = {
        comment: "Excellent book!",
        rating: 5,
      };

      const response = await request(app)
        .post(`/books/${bookId}/reviews`)
        .send(reviewData)
        .expect(201);

      expect(response.body).toMatchObject(reviewData);
      expect(response.body.id).toBeDefined();
    });

    it("should return 400 when comment is missing", async () => {
      const response = await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          rating: 5,
        })
        .expect(400);

      expect(response.body.error).toBe("Comment and rating are required");
    });

    it("should return 400 when rating is missing", async () => {
      const response = await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          comment: "Great book!",
        })
        .expect(400);

      expect(response.body.error).toBe("Comment and rating are required");
    });

    it("should return 400 when rating is invalid", async () => {
      const response = await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          comment: "Great book!",
          rating: 6,
        })
        .expect(400);

      expect(response.body.error).toBe(
        "Rating must be a number between 1 and 5"
      );
    });

    it("should return 404 for non-existent book", async () => {
      const response = await request(app)
        .post("/books/999/reviews")
        .send({
          comment: "Great book!",
          rating: 5,
        })
        .expect(404);

      expect(response.body.error).toBe("Book not found");
    });
  });

  describe("Cache Integration", () => {
    it("should handle cache miss and populate cache", async () => {
      if (!redisClient.isReady) {
        console.log("Skipping cache test - Redis not available");
        return;
      }

      // Create a book
      await request(app)
        .post("/books")
        .send({
          title: "Cache Test Book",
          author: "Cache Author",
        })
        .expect(201);

      await redisClient.flushAll();
      const response1 = await request(app).get("/books").expect(200);

      expect(response1.body).toHaveLength(1);

      const cachedData = await redisClient.get("books:all");
      expect(cachedData).toBeTruthy();
      expect(JSON.parse(cachedData)).toHaveLength(1);

      const response2 = await request(app).get("/books").expect(200);

      expect(response2.body).toEqual(response1.body);
    });
  });
});
