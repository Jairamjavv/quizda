import dotenv from "dotenv";
dotenv.config();

// Set test environment variables
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-testing";
process.env.NODE_ENV = "test";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for important issues
};
