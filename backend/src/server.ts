import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Middleware
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Main Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling
app.use(errorHandler);

// Start Server
app.listen(ENV.PORT, () => {
  console.log(`=========================================`);
  console.log(`  RazorPay Server is running on port ${ENV.PORT} `);
  console.log(`  URL: http://localhost:${ENV.PORT}              `);
  console.log(`  Client URL: ${ENV.CLIENT_URL}          `);
  console.log(`  Database URL configured.                `);
  console.log(`=========================================`);
});
