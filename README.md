# Recoup BullMQ Redis Worker

A simple BullMQ worker to process prioritized items from a Redis queue.

## Features

- ✅ Simple BullMQ worker setup
- ✅ Redis connection with configurable host/port
- ✅ Priority queue processing
- ✅ Concurrent job processing (up to 5 jobs)
- ✅ Graceful shutdown handling
- ✅ Comprehensive logging

## Installation

```bash
pnpm install
```

## Configuration

Create a `.env` file in the project root with your Redis URL:

```bash
# .env file
REDIS_URL=redis://localhost:6379
# or with password: redis://:password@localhost:6379
# or with auth: redis://username:password@localhost:6379
```

Alternatively, you can set the environment variable directly:

```bash
export REDIS_URL=redis://localhost:6379
```

## Usage

Start the worker:

```bash
pnpm start
```

For development with auto-restart:

```bash
pnpm run dev
```

## Stopping the Worker

Press `Ctrl+C` to gracefully shutdown the worker.
