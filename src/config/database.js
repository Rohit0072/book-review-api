const { DataSource } = require("typeorm")
const { Book } = require("../models/Book")
const { Review } = require("../models/Review")

const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.NODE_ENV === "test" ? ":memory:" : "database.sqlite",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [Book, Review],
  migrations: ["src/migrations/*.js"],
  subscribers: ["src/subscribers/*.js"],
})

module.exports = { AppDataSource }
