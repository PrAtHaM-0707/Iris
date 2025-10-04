"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const typeorm_1 = require("typeorm");
const models_1 = require("./models");
const dotenv_1 = __importDefault(require("dotenv"));
const winston_1 = __importDefault(require("winston"));
dotenv_1.default.config();
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.json(),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
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
(0, typeorm_1.createConnection)({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [models_1.User, models_1.ChatHistory, models_1.Message, models_1.Credits],
    synchronize: true,
    logging: true,
})
    .then(() => {
    app_1.default.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
})
    .catch((error) => logger.error('Database connection error:', error));
