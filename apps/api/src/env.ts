// Load .env from the monorepo root first (where docker-compose reads it),
// then fall back to a local .env in apps/api. Works in dev and in Docker
// (where .env is baked into the image / provided via env_file).
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(here, "../../../.env"), // monorepo root (dev)
  path.resolve(here, "../.env"),       // apps/api/.env (local override)
];

for (const p of candidates) {
  const { error } = config({ path: p });
  if (!error) {
    // loaded
    break;
  }
}
