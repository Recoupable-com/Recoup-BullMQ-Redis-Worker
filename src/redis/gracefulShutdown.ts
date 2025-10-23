import { Worker, Queue } from "bullmq";
import Redis from "ioredis";

/**
 * Gracefully shuts down the worker, queue, and Redis connection
 * @param worker The BullMQ Worker instance
 * @param queue The BullMQ Queue instance
 * @param redisConnection The Redis connection
 */
export async function gracefulShutdown(
  worker: Worker,
  queue: Queue,
  redisConnection: Redis
): Promise<void> {
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
