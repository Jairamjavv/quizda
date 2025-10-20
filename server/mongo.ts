import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_ATLAS_URL!);
const dbName = process.env.MONGODB_DBNAME || "quizda";

let db: any;

export async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

export { ObjectId };
