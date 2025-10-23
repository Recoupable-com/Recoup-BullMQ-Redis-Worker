import { Queue } from "bullmq";

/**
 * Cleans up completed jobs from the queue
 * @param queue The BullMQ Queue instance
 */
export async function cleanupCompletedJobs(queue: Queue): Promise<void> {
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
    console.error(
      "❌ Error cleaning up completed jobs:",
      (error as Error).message
    );
  }
}
