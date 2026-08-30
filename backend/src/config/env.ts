import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from local server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/razorpay?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'razorpay_jwt_default_secret_key_123',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AWS: {
    REGION: process.env.AWS_REGION || 'us-east-1',
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    S3_BUCKET: process.env.AWS_S3_BUCKET || '',
    CLOUDFRONT_URL: process.env.AWS_CLOUDFRONT_URL || '',
  }
};
