"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Send a message
router.post("/send", authMiddleware_1.authenticateToken, async (req, res) => {
    const { receiverId, content, swapId } = req.body; // Added swapId
    const myId = req.userId;
    if (!swapId) {
        return res.status(400).json({ error: "Swap ID is required to link this message." });
    }
    try {
        const message = await prisma.message.create({
            data: {
                content,
                senderId: myId,
                receiverId,
                swapId, // Now storing the specific swap instance
            },
        });
        res.json(message);
    }
    catch (error) {
        console.error("Chat Send Error:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
});
// Get conversation with a specific user for a specific swap
router.get("/conversation/:partnerId", authMiddleware_1.authenticateToken, async (req, res) => {
    const partnerId = req.params.partnerId;
    const myId = req.userId;
    const { swapId } = req.query; // Get swapId from the URL query parameters
    if (!swapId) {
        return res.status(400).json({ error: "Swap ID query parameter is required." });
    }
    try {
        const messages = await prisma.message.findMany({
            where: {
                swapId: swapId, // CRITICAL: Filters history by this specific rotation only
                OR: [
                    { senderId: myId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: myId },
                ],
            },
            orderBy: { createdAt: "asc" },
        });
        res.json(messages);
    }
    catch (error) {
        console.error("Chat Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});
exports.default = router;
