"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHistory = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Message_1 = require("./Message");
let ChatHistory = class ChatHistory {
};
exports.ChatHistory = ChatHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ChatHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChatHistory.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], ChatHistory.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp with time zone'),
    __metadata("design:type", Date)
], ChatHistory.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.chats),
    __metadata("design:type", User_1.User)
], ChatHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Message_1.Message, (message) => message.chat, { cascade: true }),
    __metadata("design:type", Array)
], ChatHistory.prototype, "messages", void 0);
exports.ChatHistory = ChatHistory = __decorate([
    (0, typeorm_1.Entity)()
], ChatHistory);
