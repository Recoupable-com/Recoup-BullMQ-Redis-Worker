// Load environment variables first
require("dotenv").config();

const { Queue } = require("bullmq");
const Redis = require("ioredis");

// Parse Redis URL manually to ensure proper connection
const url = new URL(process.env.REDIS_URL);
const redisConfig = {
  host: url.hostname,
  port: parseInt(url.port),
  password: url.password,
  lazyConnect: true,
  retryDelayOnFailover: 100,
};

// Single Redis connection for everything
const redisConnection = new Redis({
  ...redisConfig,
  maxRetriesPerRequest: null, // Required for BullMQ Queue
});

// Create queue instance
const queueName =
  process.env.NODE_ENV === "development"
    ? "dev-songs-isrc-processing"
    : "songs-isrc-processing";

const queue = new Queue(queueName, {
  connection: redisConnection,
});

// Test data
const testJobs = [
  {
    isrc: "USA2P1923591",
  },
  {
    isrc: "US6680914286",
  },
  {
    isrc: "USQY51374457",
  },
  {
    isrc: "US6682300159",
  },
];

async function addTestJobs() {
  try {
    console.log(
      `🚀 Adding ${testJobs.length} test jobs to queue: ${queueName}`
    );

    for (const jobData of testJobs) {
      const job = await queue.add("process-isrc", jobData, {
        priority: jobData.priority,
        removeOnComplete: false, // Keep completed jobs for inspection
        removeOnFail: false,
      });

      console.log(`✅ Added job: ${jobData.isrc})`);
    }

    console.log(`\n📊 Queue Status:`);
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();

    console.log(`   Waiting: ${waiting.length}`);
    console.log(`   Active: ${active.length}`);
    console.log(`   Completed: ${completed.length}`);

    console.log(
      `\n🎯 Test jobs added successfully! Your worker should start processing them.`
    );
  } catch (error) {
    console.error("❌ Error adding test jobs:", error.message);
  } finally {
    await queue.close();
    await redisConnection.quit();
    console.log("👋 Connection closed");
  }
}

// Add connection event handlers
redisConnection.on("connect", () => {
  console.log("🔗 Redis connected");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

console.log("📋 Test Job Adder");
console.log("📋 Queue:", queueName);
console.log("📋 Redis:", process.env.REDIS_URL);
console.log("📋 NODE_ENV:", process.env.NODE_ENV);
console.log("");

addTestJobs();
