import { Queue } from "bullmq";

/**
 * Shows the current status of the queue
 * @param queue The BullMQ Queue instance
 */
export async function showQueueStatus(queue: Queue): Promise<void> {
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
    console.error("❌ Error checking queue:", (error as Error).message);
  }
}
