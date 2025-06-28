const swaggerJsdoc = require("swagger-jsdoc")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Book Review API",
      version: "1.0.0",
      description: "A comprehensive Book Review Backend API built with Node.js, Express, TypeORM, SQLite, and Redis",
      contact: {
        name: "API Support",
        email: "support@bookreview.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Book: {
          type: "object",
          required: ["title", "author"],
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the book",
            },
            title: {
              type: "string",
              description: "The title of the book",
            },
            author: {
              type: "string",
              description: "The author of the book",
            },
            reviews: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Review",
              },
              description: "Reviews for this book",
            },
          },
        },
        Review: {
          type: "object",
          required: ["comment", "rating"],
          properties: {
            id: {
              type: "integer",
              description: "The auto-generated id of the review",
            },
            comment: {
              type: "string",
              description: "The review comment",
            },
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "The rating (1-5 stars)",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
}

const specs = swaggerJsdoc(options)
module.exports = specs
