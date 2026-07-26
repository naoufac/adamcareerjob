import "../env.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, queryClient } from "./client.js";

const run = async () => {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
  await queryClient.end();
};

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
