// Global test setup

const { AppDataSource } = require("./config/database");
// const jest = require("jest")
const { afterAll } = require("@jest/globals");

// increase timeout for database operations
jest.setTimeout(10000);

global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
