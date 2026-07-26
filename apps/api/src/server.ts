import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

const PORT = Number(process.env.API_PORT ?? 8781);
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "0.0.0.0";

const allowedOrigins = [
  process.env.APP_BASE_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "http://localhost:8780",
].filter((o): o is string => Boolean(o));

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: allowedOrigins,
  credentials: true,
});

app.get("/healthz", async () => {
  return {
    status: "ok",
    service: "adamjobs-api",
    time: new Date().toISOString(),
  };
});

app.get("/", async () => {
  return { name: "adamjobs-api", version: "0.1.0" };
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info({ port: PORT, origins: allowedOrigins }, "api listening");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
