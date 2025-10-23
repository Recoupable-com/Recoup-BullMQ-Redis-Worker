// Load environment variables first
require("dotenv").config();

import { createRedisConnection } from "./redis/config";
import { getQueue } from "./redis/getQueue";
import { getWorker } from "./redis/getWorker";
import { cleanupCompletedJobs } from "./redis/cleanupCompletedJobs";
import { showQueueStatus } from "./redis/showQueueStatus";
import { gracefulShutdown } from "./redis/gracefulShutdown";
import { addTestJobs } from "./test/addTestJobs";

// Single Redis connection for everything
const redisConnection = createRedisConnection();

// Add connection event handlers for debugging
redisConnection.on("connect", () => {
  console.log("🔗 Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

// Create queue instance to inspect jobs
const queue = getQueue();
const queueName = queue.name;

// Create a worker to inspect jobs (without processing them)
const worker = getWorker();

// Event listeners
worker.on("ready", async () => {
  console.log("🚀 Worker is ready and waiting for jobs...");

  // Add test jobs in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Development mode detected - adding test jobs...");
    await addTestJobs();
  }

  await cleanupCompletedJobs(queue); // Clean up any existing completed jobs first
  await showQueueStatus(queue);

  // Check for new jobs every 10 seconds
  setInterval(async () => {
    const waiting = await queue.getWaiting();
    if (waiting.length > 0) {
      console.log(`📋 New jobs detected: ${waiting.length} waiting`);
    }
  }, 10000);
});

worker.on("active", (job) => {
  console.log(`🔄 Inspecting: ${job.data.isrc}`);
});

worker.on("completed", (job) => {
  console.log(`✅ Inspected: ${job.data.isrc}`);

  // Delete the completed job so it can be re-added
  job
    .remove()
    .then(() => {
      console.log(`🗑️ Deleted completed job: ${job.data.isrc}`);
    })
    .catch((err) => {
      console.error(
        `❌ Failed to delete job ${job.data.isrc}:`,
        (err as Error).message
      );
    });
});

worker.on("failed", (job, err) => {
  if (job) {
    console.error(`❌ Failed: ${job.data.isrc} - ${err.message}`);
  } else {
    console.error(`❌ Failed: Unknown job - ${err.message}`);
  }
});

worker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

// Graceful shutdown handlers
process.on("SIGINT", () => gracefulShutdown(worker, queue, redisConnection));
process.on("SIGTERM", () => gracefulShutdown(worker, queue, redisConnection));

console.log("📋 BullMQ Worker started");
console.log("📋 Queue:", queueName);
console.log("📋 Redis:", process.env.REDIS_URL);
console.log("📋 NODE_ENV:", process.env.NODE_ENV);
console.log("📋 Environment variables loaded:", !!process.env.REDIS_URL);
console.log("📋 Press Ctrl+C to stop");
