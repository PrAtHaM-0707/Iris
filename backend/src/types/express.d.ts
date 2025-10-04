// src/types/express.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string; [key: string]: any };
  }
}

// dummy log for TS compilation
export const _check = 'express.d.ts loaded';
