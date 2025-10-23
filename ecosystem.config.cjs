module.exports = {
  apps: [
    {
      name: "recoup-bullmq-worker",
      script: "pnpm",
      args: "start",
      interpreter: "none",
      cron_restart: "0 */12 * * *",
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
