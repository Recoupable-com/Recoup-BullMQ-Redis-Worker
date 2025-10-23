/**
 * Gets the appropriate queue name based on environment
 * @returns The queue name for the current environment
 */
export function getQueueName(): string {
  return process.env.NODE_ENV === "development"
    ? "dev-songs-isrc-processing"
    : "songs-isrc-processing";
}
