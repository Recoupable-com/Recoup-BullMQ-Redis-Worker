export interface SongData {
  name: string;
  artist: string;
  album: string;
  duration: number;
}

export interface JobData {
  isrc: string;
  songData: SongData;
  priority: number;
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
