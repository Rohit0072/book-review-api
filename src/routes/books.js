const express = require("express");
const { AppDataSource } = require("../config/database");
const { redisClient } = require("../config/redis");
const { Book } = require("../models/Book");
const { Review } = require("../models/Review");

const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with their reviews
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books with reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", async (req, res, next) => {
  try {
    const cacheKey = "books:all";

    // Try to get from Redis cache first
    try {
      if (redisClient.isReady) {
        const cachedBooks = await redisClient.get(cacheKey);
        if (cachedBooks) {
          console.log("Serving books from cache");
          return res.json(JSON.parse(cachedBooks));
        }
      }
    } catch (redisError) {
      console.warn(
        "Redis error, falling back to database:",
        redisError.message
      );
    }

    // If not in cache or Redis is down, fetch from database
    const bookRepository = AppDataSource.getRepository(Book);
    const books = await bookRepository.find({
      relations: ["reviews"],
    });

    // Cache the result if Redis is available
    try {
      if (redisClient.isReady) {
        await redisClient.setEx(cacheKey, 300, JSON.stringify(books));
        console.log("Books cached successfully");
      }
    } catch (redisError) {
      console.warn("Failed to cache books:", redisError.message);
    }

    res.json(books);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: "The Great Gatsby"
 *               author:
 *                 type: string
 *                 example: "F. Scott Fitzgerald"
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", async (req, res, next) => {
  try {
    const { title, author } = req.body;

    // Validation
    if (!title || !author) {
      return res.status(400).json({
        error: "Title and author are required",
      });
    }

    if (title.trim().length === 0 || author.trim().length === 0) {
      return res.status(400).json({
        error: "Title and author cannot be empty",
      });
    }

    const bookRepository = AppDataSource.getRepository(Book);

    const existingBook = await bookRepository.findOne({
      where: { title: title.trim(), author: author.trim() },
    });

    if (existingBook) {
      return res.status(400).json({
        error: "Book with this title and author already exists",
      });
    }

    const book = bookRepository.create({
      title: title.trim(),
      author: author.trim(),
    });

    const savedBook = await bookRepository.save(book);

    // Invalidate cache
    try {
      if (redisClient.isReady) {
        await redisClient.del("books:all");
        console.log("Books cache invalidated");
      }
    } catch (redisError) {
      console.warn("Failed to invalidate cache:", redisError.message);
    }

    res.status(201).json(savedBook);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /books/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a specific book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: List of reviews for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const bookId = Number.parseInt(req.params.id);

    if (isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const bookRepository = AppDataSource.getRepository(Book);
    const book = await bookRepository.findOne({
      where: { id: bookId },
      relations: ["reviews"],
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book.reviews);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /books/{id}/reviews:
 *   post:
 *     summary: Add a new review for a book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *               - rating
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Great book! Highly recommended."
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/reviews", async (req, res, next) => {
  try {
    const bookId = Number.parseInt(req.params.id);
    const { comment, rating } = req.body;

    if (isNaN(bookId)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    // Validation
    if (!comment || rating === undefined) {
      return res.status(400).json({
        error: "Comment and rating are required",
      });
    }

    if (comment.trim().length === 0) {
      return res.status(400).json({
        error: "Comment cannot be empty",
      });
    }

    const ratingNum = Number.parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        error: "Rating must be a number between 1 and 5",
      });
    }

    const bookRepository = AppDataSource.getRepository(Book);
    const book = await bookRepository.findOne({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const reviewRepository = AppDataSource.getRepository(Review);
    const review = reviewRepository.create({
      comment: comment.trim(),
      rating: ratingNum,
      book: book,
    });

    const savedReview = await reviewRepository.save(review);

    try {
      if (redisClient.isReady) {
        await redisClient.del("books:all");
        console.log("Books cache invalidated");
      }
    } catch (redisError) {
      console.warn("Failed to invalidate cache:", redisError.message);
    }

    // Remove the book relation from response to avoid circular reference
    const { book: bookRelation, ...reviewResponse } = savedReview;

    res.status(201).json(reviewResponse);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
