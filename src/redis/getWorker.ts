import { Worker } from "bullmq";
import { JobResult } from "../types";
import { createRedisConnection } from "./config";
import { getQueueName } from "./getQueueName";

/**
 * Creates a BullMQ Worker instance with proper configuration
 * @returns A configured Worker instance
 */
export function getWorker(): Worker {
  const queueName = getQueueName();
  const redisConnection = createRedisConnection();

  return new Worker(
    queueName,
    async (job): Promise<JobResult> => {
      // Just log the job and return without processing
      console.log(`👀 Inspected job: ${job.data.isrc}`);

      // Return the job data without processing
      return {
        inspected: true,
        jobId: job.id!,
        timestamp: new Date().toISOString(),
      };
    },
    {
      connection: redisConnection,
      concurrency: 1, // Process one at a time for inspection
    }
  );
}
