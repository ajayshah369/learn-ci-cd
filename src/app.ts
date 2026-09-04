import express, { Application } from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health.routes';
import { todoRouter } from './routes/todo.routes';

/**
 * The app is built separately from the server so tests can import it
 * with supertest without ever binding a port.
 */
export function createApp(): Application {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      name: 'learn-ci-cd',
      message: 'Hello from server',
      endpoints: ['/health', '/health/ready', '/api/todos'],
    });
  });

  app.use(healthRouter);
  app.use('/api', todoRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
