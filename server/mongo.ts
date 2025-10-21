import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { logger } from "./logger.js";
dotenv.config();

logger.info("Initializing MongoDB client", {
  hasConnectionString: !!process.env.MONGODB_ATLAS_URL,
  dbName: process.env.MONGODB_DBNAME || "quizda",
});

const client = new MongoClient(process.env.MONGODB_ATLAS_URL!);
const dbName = process.env.MONGODB_DBNAME || "quizda";

let db: any;

export async function connectMongo() {
  if (!db) {
    try {
      logger.info("Connecting to MongoDB...");
      await client.connect();
      db = client.db(dbName);
      logger.info("✅ MongoDB connected successfully", { database: dbName });
    } catch (error) {
      logger.error("MongoDB connection failed", error);
      throw error;
    }
  }
  return db;
}

export { ObjectId };
