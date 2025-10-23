import Redis from "ioredis";
import { RedisConfig } from "../types";

/**
 * Creates a Redis configuration from environment variables
 */
export function createRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  const url = new URL(redisUrl);

  return {
    host: url.hostname,
    port: parseInt(url.port),
    password: url.password,
    lazyConnect: true,
    retryDelayOnFailover: 100,
  };
}

/**
 * Creates a Redis connection with BullMQ-compatible settings
 */
export function createRedisConnection(): Redis {
  const config = createRedisConfig();

  return new Redis({
    ...config,
    maxRetriesPerRequest: null, // Required for BullMQ
  });
}
