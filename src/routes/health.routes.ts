import { Router } from 'express';
import { config } from '../config';

export const healthRouter = Router();

/**
 * Liveness probe.
 * "Is the process up?" — CI/CD and orchestrators (Docker, Kubernetes,
 * a deploy smoke test) hit this to decide whether the container is alive.
 * It must be cheap and must not depend on any external service.
 */
healthRouter.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: config.version,
    commit: config.commit,
    env: config.nodeEnv,
  });
});

/**
 * Readiness probe.
 * "Can it serve traffic?" — this is where you would check the database,
 * Redis, a queue, etc. Right now there are no dependencies, so it always
 * reports ready; the shape is here so you can add checks later.
 */
healthRouter.get('/health/ready', (_req, res) => {
  const checks = {
    database: 'ok', // placeholder — swap for a real ping later
  };
  const ready = Object.values(checks).every((v) => v === 'ok');

  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready', checks });
});
