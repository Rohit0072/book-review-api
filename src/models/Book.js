const { EntitySchema } = require("typeorm")

const Book = new EntitySchema({
  name: "Book",
  tableName: "books",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    title: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    author: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
  },
  relations: {
    reviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "book",
      cascade: true,
    },
  },
})

module.exports = { Book }
