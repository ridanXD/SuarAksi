"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.toggleFollow = toggleFollow;
exports.getUserActivity = getUserActivity;
const profileService = __importStar(require("../services/profile.service"));
async function getProfile(req, res, next) {
    try {
        const { username } = req.params;
        const profile = await profileService.getProfileByUsername(username, req.user?.id);
        res.status(200).json({ success: true, data: profile });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}
async function toggleFollow(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Tidak terautentikasi" });
            return;
        }
        const { id } = req.params;
        const result = await profileService.toggleFollow(req.user.id, id);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
async function getUserActivity(req, res, next) {
    try {
        const { username } = req.params;
        const tab = req.query.tab || "posts";
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 15;
        const result = await profileService.getUserActivity(username, tab, page, limit);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
