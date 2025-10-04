import { AuthRequest } from '../types/authRequest';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("Server: Auth middleware loaded for URL:", req.url); // Log middleware entry
  console.log("Server: Auth middleware - Incoming headers:", req.headers); // Log all headers to verify Authorization
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log("Server: Auth middleware - No token provided");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = decoded;
    console.log("Server: Auth middleware - req.user set:", req.user);
    next();
  } catch (error) {
    console.log("Server: Auth middleware - JWT verification failed:", (error as Error).message);
    res.status(401).json({ message: 'Invalid token' });
  }
};