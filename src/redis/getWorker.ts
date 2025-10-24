import { Worker } from "bullmq";
import { createRedisConnection } from "./config";
import { getQueueName } from "./getQueueName";
import getSongsByIsrc from "../songs/getSongsByIsrc";

export interface JobResult {
  inspected: boolean;
  jobId: string;
  timestamp: string;
  processed?: boolean;
  trackData?: any;
  error?: string;
}

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
      const isrc = job.data.isrc;
      console.log(`🔄 Processing job: ${isrc}`);

      try {
        // Process the ISRC using getSongsByIsrc
        const results = await getSongsByIsrc([isrc]);
        const result = results[0]; // Get the first (and only) result
        return {
          inspected: true,
          jobId: job.id!,
          timestamp: new Date().toISOString(),
          processed: true,
          trackData: result,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Job processing failed for ${isrc}:`, errorMessage);

        return {
          inspected: true,
          jobId: job.id!,
          timestamp: new Date().toISOString(),
          processed: false,
          error: errorMessage,
        };
      }
    },
    {
      connection: redisConnection,
      concurrency: 1, // Process one at a time
    }
  );
}
