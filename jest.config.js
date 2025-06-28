module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/**",
    "!src/migrations/**",
    "!src/scripts/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  setupFilesAfterEnv: ["<rootDir>/src/setup.js"],
  testTimeout: 10000,
};
