import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
});

async function addModeColumn() {
  try {
    await client.connect();
    console.log("Connected to database");

    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='mode'
    `);

    if (checkColumn.rows.length === 0) {
      console.log("Adding 'mode' column to users table...");

      // Add mode column with default value 'attempt'
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN mode VARCHAR(50) DEFAULT 'attempt'
      `);

      console.log("✅ Successfully added 'mode' column to users table");
      if (process.env.MIGRATION_VERBOSE === "true") {
        console.log("   - Default value: 'attempt'");
        console.log("   - Existing users will have mode='attempt'");
      }
    } else {
      console.log("ℹ️  'mode' column already exists in users table");
    }

    // Optionally print schema when MIGRATION_VERBOSE=true
    if (process.env.MIGRATION_VERBOSE === "true") {
      const schema = await client.query(`
        SELECT column_name, data_type, column_default
        FROM information_schema.columns 
        WHERE table_name='users'
        ORDER BY ordinal_position
      `);

      console.log("\n📋 Current users table schema:");
      schema.rows.forEach((row) => {
        console.log(
          `   - ${row.column_name} (${row.data_type})${
            row.column_default ? ` DEFAULT ${row.column_default}` : ""
          }`
        );
      });
    } else {
      console.log(
        "Schema output suppressed. Set MIGRATION_VERBOSE=true to enable detailed output."
      );
    }
  } catch (error) {
    console.error("❌ Error adding mode column:", error);
    throw error;
  } finally {
    await client.end();
    if (process.env.MIGRATION_VERBOSE === "true") {
      console.log("\nDatabase connection closed");
    }
  }
}

// Run migration
addModeColumn()
  .then(() => {
    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
