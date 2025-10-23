import { Queue } from "bullmq";
import { createRedisConnection } from "./config";
import { getQueueName } from "./getQueueName";

/**
 * Creates a BullMQ Queue instance with proper configuration
 * @returns A configured Queue instance
 */
export function getQueue(): Queue {
  const queueName = getQueueName();
  const redisConnection = createRedisConnection();

  return new Queue(queueName, {
    connection: redisConnection,
  });
}
