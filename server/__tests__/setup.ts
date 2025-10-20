import { jest } from "@jest/globals";
import dotenv from "dotenv";
dotenv.config();

// Set test environment variables
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-testing";
process.env.NODE_ENV = "test";
process.env.NEON_DATABASE_URL =
  process.env.NEON_DATABASE_URL || "postgresql://test:test@localhost:5432/test";
process.env.MONGODB_ATLAS_URL =
  process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/test";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for important issues
};
