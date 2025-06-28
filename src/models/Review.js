const { EntitySchema } = require("typeorm")

const Review = new EntitySchema({
  name: "Review",
  tableName: "reviews",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    comment: {
      type: "text",
      nullable: false,
    },
    rating: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    book: {
      type: "many-to-one",
      target: "Book",
      joinColumn: {
        name: "bookId",
      },
      onDelete: "CASCADE",
    },
  },
})

module.exports = { Review }
