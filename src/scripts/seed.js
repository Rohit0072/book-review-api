const { AppDataSource } = require("../config/database");
const { Book } = require("../models/Book");
const { Review } = require("../models/Review");

const seedData = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const bookRepository = AppDataSource.getRepository(Book);
    const reviewRepository = AppDataSource.getRepository(Review);

    // Clear existing data
    await reviewRepository.clear();
    await bookRepository.clear();
    console.log("🗑️  Cleared existing data");

    // Create sample books
    const books = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
      },
      {
        title: "1984",
        author: "George Orwell",
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
      },
    ];

    const savedBooks = [];
    for (const bookData of books) {
      const book = bookRepository.create(bookData);
      const savedBook = await bookRepository.save(book);
      savedBooks.push(savedBook);
      console.log(`Created book: ${savedBook.title}`);
    }

    // Create sample reviews
    const reviews = [
      {
        bookIndex: 0,
        comment: "A masterpiece of American literature!",
        rating: 5,
      },
      {
        bookIndex: 0,
        comment: "Beautiful prose and compelling characters.",
        rating: 4,
      },
      { bookIndex: 1, comment: "Powerful and thought-provoking.", rating: 5 },
      { bookIndex: 1, comment: "A must-read classic.", rating: 5 },
      { bookIndex: 1, comment: "Excellent storytelling.", rating: 4 },
      { bookIndex: 2, comment: "Chilling and prophetic.", rating: 5 },
      { bookIndex: 2, comment: "Orwell was ahead of his time.", rating: 5 },
      { bookIndex: 3, comment: "Witty and romantic.", rating: 4 },
      { bookIndex: 3, comment: "Jane Austen at her finest.", rating: 5 },
      { bookIndex: 4, comment: "Captures teenage angst perfectly.", rating: 4 },
    ];

    for (const reviewData of reviews) {
      const review = reviewRepository.create({
        comment: reviewData.comment,
        rating: reviewData.rating,
        book: savedBooks[reviewData.bookIndex],
      });
      await reviewRepository.save(review);
      console.log(
        `Created review for: ${savedBooks[reviewData.bookIndex].title}`
      );
    }

    console.log("Seed data created successfully!");
    console.log(
      `Created ${savedBooks.length} books and ${reviews.length} reviews`
    );
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await AppDataSource.destroy();
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
