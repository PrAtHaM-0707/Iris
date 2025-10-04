import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User, ChatHistory, Message, Credits } from './models';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, ChatHistory, Message, Credits],
  migrations: ['src/migrations/*.ts'], // path to your migrations
  synchronize: false, // migrations handle schema changes
  logging: true,
});
