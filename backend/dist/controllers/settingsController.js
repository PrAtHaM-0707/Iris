"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggle2FA = exports.updateSettings = void 0;
const updateSettings = async (req, res) => {
    res.json({ message: 'Settings updated' });
};
exports.updateSettings = updateSettings;
const toggle2FA = async (req, res) => {
    res.json({ message: '2FA toggled' });
};
exports.toggle2FA = toggle2FA;
