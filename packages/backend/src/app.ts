import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';

import { config } from './config';
import { errorHandler } from './middlewares';
import routes from './routes';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors(config.cors));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
  });
});

// Error handler
app.use(errorHandler);

export default app;
