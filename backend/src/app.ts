import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import profileRoutes from './routes/profile';
import plansRoutes from './routes/plans';
import settingsRoutes from './routes/settings';
import { errorHandler } from './middlewares/errorMiddleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/settings', settingsRoutes);

app.use(errorHandler);

export default app;