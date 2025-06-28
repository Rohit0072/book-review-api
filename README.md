# Book Review Backend API

A comprehensive Book Review Backend API built with Node.js, Express.js, TypeORM, SQLite, and Redis caching, also I used Claude AI for documentation help.

## 🚀 Features

- **RESTful API** with 4 main endpoints
- **SQLite Database** with TypeORM for data persistence
- **Redis Caching** for improved performance
- **Comprehensive Testing** with Jest and Supertest
- **API Documentation** with Swagger/OpenAPI
- **Error Handling** with custom middleware
- **Docker Support** for easy deployment
- **Health Check** endpoint for monitoring

## 📋 API Endpoints

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/books`             | List all books with reviews |
| POST   | `/books`             | Add a new book              |
| GET    | `/books/:id/reviews` | Get all reviews for a book  |
| POST   | `/books/:id/reviews` | Add a new review for a book |
| GET    | `/health`            | Health check endpoint       |
| GET    | `/docs`              | API documentation           |

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite with TypeORM
- **Caching**: Redis
- **Testing**: Jest + Supertest
- **Documentation**: Swagger UI + swagger-jsdoc
- **Containerization**: Docker & Docker Compose

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or higher
- Redis server (optional, API works without it)
- npm or yarn

### Installation

1. **Clone the repository**
   git clone <repository-url>
   cd book-review-api

2. **Install dependencies**
   npm install

3. **Start Redis (optional but recommended)**

   # Using Docker

   docker run -d -p 6379:6379 redis:7-alpine

   # Or using local Redis installation

   redis-server

4. **Run database migrations**
   npm run migration:run

5. **Seed the database (optional)**
   node src/scripts/seed.js

6. **Start the server**

   # Development mode with auto-reload

   npm run dev

   # Production mode

   npm start

The server will start on \`http://localhost:3000\`

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

# Start both API and Redis

docker-compose up -d

# View logs

docker-compose logs -f

# Stop services

docker-compose down

### Using Docker only

# Build the image

docker build -t book-review-api .

# Run with Redis

docker run -d --name redis redis:7-alpine
docker run -d -p 3000:3000 --link redis:redis -e REDIS_URL=redis://redis:6379 book-review-api

## 🧪 Testing

# Run all tests

npx jest --config=jest.config.js

### Test Coverage

The test suite includes:

- Unit tests for all API endpoints
- Integration tests for database operations
- Cache integration tests
- Error handling tests
- Health check tests

## 📚 API Documentation

Once the server is running, visit \`http://localhost:3000/docs\` to access the interactive Swagger documentation.

### Example API Usage

**Create a Book:**
curl -X POST http://localhost:3000/books \\
-H "Content-Type: application/json" \\
-d '{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald"}'

**Get All Books:**
curl http://localhost:3000/books

**Add a Review:**

curl -X POST http://localhost:3000/books/1/reviews \\
-H "Content-Type: application/json" \\
-d '{"comment": "Amazing book!", "rating": 5}'

**Get Reviews for a Book:**

curl http://localhost:3000/books/1/reviews

## 🗄️ Database Schema

### Books Table

- \`id\`: Integer (Primary Key)
- \`title\`: String (Required)
- \`author\`: String (Required)

### Reviews Table

- \`id\`: Integer (Primary Key)
- \`comment\`: Text (Required)
- \`rating\`: Integer (1-5, Required)
- \`bookId\`: Integer (Foreign Key)

## 🔧 Configuration

### Environment Variables

| Variable      | Description          | Default                |
| ------------- | -------------------- | ---------------------- |
| \`PORT\`      | Server port          | 3000                   |
| \`NODE_ENV\`  | Environment          | development            |
| \`REDIS_URL\` | Redis connection URL | redis://localhost:6379 |

### Redis Configuration

The API gracefully handles Redis unavailability:

- If Redis is available: Responses are cached for 5 minutes
- If Redis is unavailable: API falls back to database queries
- Cache is automatically invalidated when data changes

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors
- **503 Service Unavailable**: Cache service issues

All errors return JSON responses with descriptive messages.

## 📊 Monitoring

### Health Check

The \`/health\` endpoint provides system status:
\`\`\`json
{
"status": "OK",
"timestamp": "2024-01-01T00:00:00.000Z",
"database": "Connected",
"redis": "Connected"
}
\`\`\`

## 🔄 Database Migrations

\`\`\`bash

# Generate a new migration

npm run migration:generate -- -n MigrationName

# Run pending migrations

npm run migration:run

# Revert last migration

npm run migration:revert
\`\`\`

## 🎯 Performance Features

- **Redis Caching**: GET /books responses cached for 5 minutes
- **Connection Pooling**: Efficient database connections
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Graceful Shutdown**: Proper cleanup on server termination

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: DDoS protection
- **Input Validation**: Prevents injection attacks
- **Error Sanitization**: No sensitive data in error responses

## 🆘 Support

If you encounter any issues:

1. Check the logs: \`docker-compose logs\` or console output
2. Verify Redis is running: \`redis-cli ping\`
3. Check database file permissions
4. Review the API documentation at \`/docs\`
