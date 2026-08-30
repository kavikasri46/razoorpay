import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();

// Middleware - Allow all frontend origins dynamically (Vercel, localhost, custom domains)
app.use(cors({
  origin: (_origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root welcome & Health check endpoints
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'RazorPay Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main Routes
app.use('/api', apiRouter);

// Centralized error handling
app.use(errorHandler);

// Start Server (only when not running inside serverless lambda)
if (!process.env.VERCEL) {
  app.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`  RazorPay Server is running on port ${ENV.PORT} `);
    console.log(`  URL: http://localhost:${ENV.PORT}              `);
    console.log(`  Client URL: ${ENV.CLIENT_URL}          `);
    console.log(`  Database URL configured.                `);
    console.log(`=========================================`);
  });
}

export default app;
