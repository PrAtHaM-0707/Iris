import app from './app';
import { createConnection } from 'typeorm';
import { User, ChatHistory, Message, Credits } from './models';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

const PORT = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL not set in .env');
  process.exit(1);
}
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.error('Cloudinary credentials not set in .env');
  process.exit(1);
}

createConnection({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, ChatHistory, Message, Credits],
  synchronize: true,
  logging: true,
})
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => logger.error('Database connection error:', error));