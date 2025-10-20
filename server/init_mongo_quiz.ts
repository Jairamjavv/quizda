import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_ATLAS_URL!);
const dbName = process.env.MONGODB_DBNAME || "quizda";

async function ensureCollections() {
  await client.connect();
  console.log("Creating MongoDB collections if they don't exist...\n");

  const db = client.db(dbName);
  const collections = ["quizzes", "questions", "groups"];

  for (const collectionName of collections) {
    const collectionsList = await db
      .listCollections({ name: collectionName })
      .toArray();
    if (collectionsList.length > 0) {
      console.log(`  ✓ Collection '${collectionName}' exists`);
    } else {
      await db.createCollection(collectionName);
      console.log(`  ✓ Collection '${collectionName}' created`);
    }
  }

  await client.close();
  console.log("\n✅ All MongoDB collections are ready.");
}

ensureCollections().catch((err) => {
  console.error("❌ Error creating MongoDB collections:", err);
  client.close();
  process.exit(1);
});
