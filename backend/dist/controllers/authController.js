"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.forgotPassword = exports.logout = exports.googleAuth = exports.login = exports.register = void 0;
const typeorm_1 = require("typeorm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        console.log('Register request:', { email, name });
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) {
            console.log('Registration failed: User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        console.log('Password hashed for:', email);
        const user = userRepo.create({
            email,
            name,
            password: hashedPassword,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        });
        await userRepo.save(user);
        console.log('User created:', user.id, user.email);
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    }
    catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login request:', { email });
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
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
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Login failed: Invalid password for:', email);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    }
    catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const googleAuth = async (req, res) => {
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
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
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
        }
        else if (!user.provider || !user.providerId) {
            // Update existing user to link Google account
            console.log('Linking Google account to existing user:', email);
            user.provider = 'google';
            user.providerId = providerId;
            user.avatar = avatar || user.avatar;
            await userRepo.save(user);
        }
        const jwtToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
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
    }
    catch (error) {
        console.error('Google auth error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.googleAuth = googleAuth;
const logout = (req, res) => {
    console.log('Logout request received');
    res.json({ message: 'Logged out' });
    console.log('Logout response sent');
};
exports.logout = logout;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Forgot password request:', { email });
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user) {
            console.log('Forgot password failed: User not found:', email);
            return res.status(400).json({ message: 'User not found' });
        }
        if (user.provider === 'google') {
            console.log('Forgot password failed: User registered with Google:', email);
            return res.status(400).json({ message: 'Use Google Sign-In to reset your account' });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Reset token generated for user:', user.id);
        await (0, emailService_1.sendResetEmail)(email, resetToken);
        console.log('Reset email sent (mock) for:', email);
        res.json({ message: 'Reset link sent' });
    }
    catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching current user:', userId);
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
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
    }
    catch (error) {
        console.error('Get current user error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCurrentUser = getCurrentUser;
