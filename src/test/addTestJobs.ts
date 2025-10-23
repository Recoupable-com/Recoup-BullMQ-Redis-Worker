// Load environment variables first
require("dotenv").config();

import { getQueue } from "../redis/getQueue";
import { testJobs } from "./testJobs";

async function addTestJobs(): Promise<void> {
  const queue = getQueue();
  const queueName = queue.name;

  try {
    console.log(
      `🚀 Adding ${testJobs.length} test jobs to queue: ${queueName}`
    );

    for (const jobData of testJobs) {
      await queue.add("process-isrc", jobData, {
        removeOnComplete: false, // Keep completed jobs for inspection
        removeOnFail: false,
      });

      console.log(`✅ Added job: ${jobData.isrc}`);
    }

    console.log(`\n📊 Queue Status:`);
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();

    console.log(`   Waiting: ${waiting.length}`);
    console.log(`   Active: ${active.length}`);
    console.log(`   Completed: ${completed.length}`);

    console.log(`\n🎯 Test jobs added successfully!`);
  } catch (error) {
    console.error("❌ Error adding test jobs:", (error as Error).message);
  }
}

// Export the function for use in other scripts
export { addTestJobs };
