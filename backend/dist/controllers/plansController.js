"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCredits = exports.subscribePlan = exports.getPlan = void 0;
const typeorm_1 = require("typeorm");
const razorpay_1 = __importDefault(require("razorpay"));
const Credits_1 = require("../models/Credits");
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('Razorpay environment variables missing');
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
}
const rzp = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const DAILY_CREDITS = {
    free: 5,
    basic: 20,
    premium: 100,
};
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily credits reset at 12 AM IST');
        const creditsRepo = (0, typeorm_1.getRepository)(Credits_1.Credits);
        const creditsList = await creditsRepo.find({ relations: ['user'] });
        const now = new Date();
        for (const credits of creditsList) {
            if (credits.expirationDate && now > new Date(credits.expirationDate)) {
                credits.plan = 'free';
                credits.balance = DAILY_CREDITS.free;
                credits.expirationDate = undefined;
            }
            else {
                credits.balance = DAILY_CREDITS[credits.plan];
            }
            credits.lastReset = now;
            await creditsRepo.save(credits);
            console.log(`Reset credits for user ${credits.user.id}: ${credits.plan}, ${credits.balance}`);
        }
    }
    catch (error) {
        console.error('Daily reset error:', error.message || error);
    }
}, {
    timezone: 'Asia/Kolkata',
});
const getPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching plan for user:', userId);
        const creditsRepo = (0, typeorm_1.getRepository)(Credits_1.Credits);
        let credits = await creditsRepo.findOne({ where: { user: { id: userId } }, relations: ['user'] });
        if (!credits) {
            console.log('No credits found for user:', userId, 'Creating default credits');
            const userRepo = (0, typeorm_1.getRepository)(User_1.User);
            const user = await userRepo.findOne({ where: { id: userId } });
            if (!user) {
                console.log('User not found:', userId);
                return res.status(404).json({ message: 'User not found' });
            }
            credits = creditsRepo.create({
                balance: DAILY_CREDITS.free,
                plan: 'free',
                user,
                lastReset: new Date(),
                expirationDate: undefined
            });
            await creditsRepo.save(credits);
            console.log('Default credits created:', credits.plan, 'balance:', credits.balance);
        }
        else {
            const now = new Date();
            const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const lastReset = credits.lastReset ? new Date(credits.lastReset) : new Date(0);
            const istLastReset = new Date(lastReset.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            if (credits.expirationDate && now > new Date(credits.expirationDate)) {
                console.log('Plan expired for user:', userId);
                credits.plan = 'free';
                credits.balance = DAILY_CREDITS.free;
                credits.expirationDate = undefined;
            }
            const isNewDay = istNow.getDate() !== istLastReset.getDate() ||
                istNow.getMonth() !== istLastReset.getMonth() ||
                istNow.getFullYear() !== istLastReset.getFullYear();
            if (isNewDay) {
                credits.balance = DAILY_CREDITS[credits.plan];
                credits.lastReset = now;
                console.log('Daily credits reset for user:', userId, 'Plan:', credits.plan, 'Balance:', credits.balance);
                await creditsRepo.save(credits);
            }
        }
        console.log('Plan fetched:', credits.plan, 'balance:', credits.balance);
        res.json({ plan: credits.plan, balance: credits.balance });
    }
    catch (error) {
        console.error('Get plan error:', error.message || error);
        res.status(500).json({ message: 'Server error', error: error.message || String(error) });
    }
};
exports.getPlan = getPlan;
const subscribePlan = async (req, res) => {
    try {
        const { planId, amount } = req.body;
        const userId = req.user.id;
        console.log('Subscribing plan for user:', userId, 'planId:', planId, 'amount:', amount);
        if (!['basic', 'premium'].includes(planId)) {
            console.log('Invalid planId:', planId);
            return res.status(400).json({ message: 'Invalid plan ID' });
        }
        if (typeof amount !== 'number' || amount <= 0) {
            console.log('Invalid amount:', amount);
            return res.status(400).json({ message: 'Invalid amount' });
        }
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `rcpt_${userId.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
        };
        console.log('Creating Razorpay order:', options);
        let order;
        try {
            order = await rzp.orders.create(options);
            console.log('Razorpay order created:', order.id);
        }
        catch (razorpayError) {
            console.error('Razorpay order creation failed:', razorpayError);
            return res.status(500).json({ message: 'Failed to create Razorpay order', error: razorpayError.message || String(razorpayError) });
        }
        const creditsRepo = (0, typeorm_1.getRepository)(Credits_1.Credits);
        const userRepo = (0, typeorm_1.getRepository)(User_1.User);
        const user = await userRepo.findOne({ where: { id: userId } });
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }
        let credits = await creditsRepo.findOne({ where: { user: { id: userId } } });
        if (!credits) {
            console.log('Creating new credits record for user:', userId);
            credits = creditsRepo.create({ balance: 0, plan: 'free', user });
        }
        credits.plan = planId;
        credits.balance = DAILY_CREDITS[planId];
        credits.lastReset = new Date();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        credits.expirationDate = planId !== 'free' ? expirationDate : undefined;
        await creditsRepo.save(credits);
        console.log('Credits updated:', credits.plan, 'balance:', credits.balance, 'expiration:', credits.expirationDate);
        res.json({ order, message: 'Plan subscription initiated' });
    }
    catch (error) {
        console.error('Subscribe plan error:', error.message || error);
        res.status(500).json({ message: 'Payment error', error: error.message || String(error) });
    }
};
exports.subscribePlan = subscribePlan;
const updateCredits = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;
        console.log(`Updating credits for user ${userId}, deducting ${amount}`);
        const creditsRepo = (0, typeorm_1.getRepository)(Credits_1.Credits);
        const credits = await creditsRepo.findOne({ where: { user: { id: userId } } });
        if (!credits) {
            console.log('Credits not found for user:', userId);
            return res.status(404).json({ message: 'Credits not found' });
        }
        credits.balance = Math.max(0, credits.balance - amount);
        await creditsRepo.save(credits);
        console.log(`Credits updated for user ${userId}, new balance: ${credits.balance}`);
        res.json({ balance: credits.balance });
    }
    catch (error) {
        console.error('Update credits error:', error.message || error);
        res.status(500).json({ message: 'Server error', error: error.message || String(error) });
    }
};
exports.updateCredits = updateCredits;
