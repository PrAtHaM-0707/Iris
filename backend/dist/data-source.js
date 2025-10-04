"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
dotenv_1.default.config();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [models_1.User, models_1.ChatHistory, models_1.Message, models_1.Credits],
    migrations: ['src/migrations/*.ts'], // path to your migrations
    synchronize: false, // migrations handle schema changes
    logging: true,
});
