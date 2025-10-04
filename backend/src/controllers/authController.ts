import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { sendResetEmail } from '../services/emailService';
import { AuthRequest } from '../types/authRequest';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    console.log('Register request:', { email, name });
    const userRepo = getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      console.log('Registration failed: User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed for:', email);

    const user = userRepo.create({
      email,
      name,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });

    await userRepo.save(user);
    console.log('User created:', user.id, user.email);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    console.log('JWT generated for user:', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: unknown) {
    console.error('Register error:', (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login request:', { email });
    const userRepo = getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      console.log('Login failed: User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.provider === 'google') {
      console.log('Login failed: User registered with Google:', email);
      return res.status(400).json({ message: 'Use Google Sign-In for this account' });
    }

    if (!user.password) {
      console.log('Login failed: No password set for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    console.log('JWT generated for user:', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    console.log('Google auth request, token received');

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      console.log('Google auth failed: Invalid token');
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { sub: providerId, email, name, picture: avatar } = payload;
    if (!email) {
      console.log('Google auth failed: No email in token');
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    const userRepo = getRepository(User);
    let user = await userRepo.findOne({ where: { email } });

    if (!user) {
      // Create new user for first-time Google login
      console.log('Creating new user for Google auth:', email);
      user = userRepo.create({
        email,
        name: name || 'Unknown',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'google',
        providerId,
      });
      await userRepo.save(user);
      console.log('New Google user created:', user.id, user.email);
    } else if (!user.provider || !user.providerId) {
      // Update existing user to link Google account
      console.log('Linking Google account to existing user:', email);
      user.provider = 'google';
      user.providerId = providerId;
      user.avatar = avatar || user.avatar;
      await userRepo.save(user);
    }

    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    console.log('JWT generated for Google user:', user.id);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: unknown) {
    console.error('Google auth error:', (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = (req: Request, res: Response) => {
  console.log('Logout request received');
  res.json({ message: 'Logged out' });
  console.log('Logout response sent');
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log('Forgot password request:', { email });
    const userRepo = getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      console.log('Forgot password failed: User not found:', email);
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.provider === 'google') {
      console.log('Forgot password failed: User registered with Google:', email);
      return res.status(400).json({ message: 'Use Google Sign-In to reset your account' });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    console.log('Reset token generated for user:', user.id);

    await sendResetEmail(email, resetToken);
    console.log('Reset email sent (mock) for:', email);

    res.json({ message: 'Reset link sent' });
  } catch (error: unknown) {
    console.error('Forgot password error:', (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log('Fetching current user:', userId);
    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Current user fetched:', user.email);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: unknown) {
    console.error('Get current user error:', (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};