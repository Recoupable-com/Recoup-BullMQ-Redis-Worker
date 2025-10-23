export interface JobData {
  isrc: string;
}

export interface JobResult {
  inspected: boolean;
  jobId: string;
  timestamp: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  lazyConnect: boolean;
  retryDelayOnFailover: number;
}
