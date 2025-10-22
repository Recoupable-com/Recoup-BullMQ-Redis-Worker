// Load environment variables first
require("dotenv").config();

// Verify environment is loaded
const redisUrl = process.env.REDIS_URL;
console.log("🔧 Environment loaded, Redis URL:", redisUrl);

// Parse Redis URL manually to ensure proper connection
const url = new URL(redisUrl);
const redisConfig = {
  host: url.hostname,
  port: parseInt(url.port),
  password: url.password,
  lazyConnect: true,
  retryDelayOnFailover: 100,
};

console.log("🔧 Parsed Redis config:", {
  host: redisConfig.host,
  port: redisConfig.port,
  hasPassword: !!redisConfig.password,
});

const { Worker, Queue } = require("bullmq");
const Redis = require("ioredis");

// Single Redis connection for everything
const redisConnection = new Redis({
  ...redisConfig,
  maxRetriesPerRequest: null, // Required for BullMQ Worker
});

// Add connection event handlers for debugging
redisConnection.on("connect", () => {
  console.log("🔗 Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

// Create queue instance to inspect jobs
const queue = new Queue("songs-isrc-processing", {
  connection: redisConnection,
});

// Create a worker to inspect jobs (without processing them)
const worker = new Worker(
  "songs-isrc-processing",
  async (job) => {
    // Just log the job and return without processing
    console.log(`👀 Inspected job: ${job.data.isrc}`);

    // Return the job data without processing
    return {
      inspected: true,
      jobId: job.id,
      timestamp: new Date().toISOString(),
    };
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process one at a time for inspection
  }
);

// Function to clean up completed jobs
async function cleanupCompletedJobs() {
  try {
    const completed = await queue.getCompleted();
    if (completed.length > 0) {
      console.log(`🧹 Cleaning up ${completed.length} completed jobs...`);
      for (const job of completed) {
        await job.remove();
        console.log(`🗑️ Deleted completed job: ${job.data.isrc}`);
      }
      console.log("✅ Cleanup completed");
    }
  } catch (error) {
    console.error("❌ Error cleaning up completed jobs:", error.message);
  }
}

// Function to show queue status
async function showQueueStatus() {
  try {
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    console.log(
      `📊 Queue Status: Waiting: ${waiting.length}, Active: ${active.length}, Completed: ${completed.length}, Failed: ${failed.length}`
    );

    if (waiting.length > 0) {
      console.log(`📋 Found ${waiting.length} jobs waiting to be processed`);
      waiting.forEach((job, index) => {
        console.log(`  ${index + 1}. ${job.data.isrc}`);
      });
    } else {
      console.log("📋 No jobs currently waiting in queue");
    }
  } catch (error) {
    console.error("❌ Error checking queue:", error.message);
  }
}

// Event listeners
worker.on("ready", async () => {
  console.log("🚀 Worker is ready and waiting for jobs...");
  await cleanupCompletedJobs(); // Clean up any existing completed jobs first
  await showQueueStatus();

  // Check for new jobs every 10 seconds
  setInterval(async () => {
    const waiting = await queue.getWaiting();
    if (waiting.length > 0) {
      console.log(`📋 New jobs detected: ${waiting.length} waiting`);
    }
  }, 10000);
});

worker.on("active", (job) => {
  console.log(
    `🔄 Inspecting: ${job.data.isrc} - ${job.data.songData?.name || "Unknown"}`
  );
});

worker.on("completed", (job, result) => {
  console.log(`✅ Inspected: ${job.data.isrc}`);

  // Delete the completed job so it can be re-added
  job
    .remove()
    .then(() => {
      console.log(`🗑️ Deleted completed job: ${job.data.isrc}`);
    })
    .catch((err) => {
      console.error(`❌ Failed to delete job ${job.data.isrc}:`, err.message);
    });
});

worker.on("failed", (job, err) => {
  console.error(`❌ Failed: ${job.data.isrc} - ${err.message}`);
});

worker.on("error", (err) => {
  console.error("❌ Worker error:", err);
});

// Graceful shutdown function
async function gracefulShutdown() {
  console.log("\n🛑 Shutting down worker gracefully...");

  try {
    // Close worker first
    await worker.close();
    console.log("✅ Worker closed");
  } catch (error) {
    console.log("⚠️ Worker already closed");
  }

  try {
    // Close queue
    await queue.close();
    console.log("✅ Queue closed");
  } catch (error) {
    console.log("⚠️ Queue already closed");
  }

  try {
    // Close Redis connection
    await redisConnection.quit();
    console.log("✅ Redis connection closed");
  } catch (error) {
    console.log("⚠️ Redis connection already closed");
  }

  console.log("👋 Shutdown complete");
  process.exit(0);
}

// Graceful shutdown handlers
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

console.log("📋 BullMQ Worker started");
console.log("📋 Queue: songs-isrc-processing");
console.log("📋 Redis:", process.env.REDIS_URL);
console.log("📋 NODE_ENV:", process.env.NODE_ENV);
console.log("📋 Environment variables loaded:", !!process.env.REDIS_URL);
console.log("📋 Press Ctrl+C to stop");
