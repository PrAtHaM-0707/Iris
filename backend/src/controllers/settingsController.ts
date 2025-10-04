import { Request, Response } from 'express';

export const updateSettings = async (req: Request, res: Response) => {
  res.json({ message: 'Settings updated' });
};

export const toggle2FA = async (req: Request, res: Response) => {
  res.json({ message: '2FA toggled' });
};