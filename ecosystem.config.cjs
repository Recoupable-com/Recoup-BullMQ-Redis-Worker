module.exports = {
  apps: [
    {
      name: "recoup-bullmq-worker",
      script: "dist/worker.js",
      interpreter: "node",
      cron_restart: "0 */12 * * *",
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
