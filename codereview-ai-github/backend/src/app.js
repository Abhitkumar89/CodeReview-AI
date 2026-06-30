import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env, isProd } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', uptime: process.uptime() });
  });

  // Rate limit the whole API surface
  app.use('/api', apiLimiter);

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', reviewRoutes);

  // 404 + centralised error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
