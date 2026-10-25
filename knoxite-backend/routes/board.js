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
// Helper function to calculate "Time Ago" for the frontend
function timeSince(date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1)
        return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1)
        return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1)
        return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1)
        return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1)
        return Math.floor(interval) + "m ago";
    return "Just now";
}
// 1. GET ALL POSTS (With Data Mapping)
router.get("/", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const posts = await prisma.boardPost.findMany({
            include: {
                author: { select: { name: true, avatarUrl: true } } // Fetching Avatar!
            },
            orderBy: { createdAt: "desc" }
        });
        // Map the database fields to the exact format the frontend CommunityForumPage expects
        const formattedPosts = posts.map((post) => ({
            id: post.id,
            author: post.author.name,
            avatarUrl: post.author.avatarUrl,
            title: post.looking, // Mapped from 'looking'
            category: post.offering, // Mapped from 'offering'
            content: post.description, // Mapped from 'description'
            timeAgo: timeSince(post.createdAt),
            // Adding a slight deterministic randomizer based on the ID length to simulate an active community
            likes: (post.id.length % 12) + 2,
            replies: (post.id.length % 5) + 1
        }));
        res.status(200).json(formattedPosts);
    }
    catch (error) {
        console.error("Fetch Board Error:", error);
        res.status(500).json({ error: "Failed to fetch board posts." });
    }
});
// 2. CREATE POST (Matching the frontend route: /api/board/post)
router.post("/post", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const userId = req.user?.id || req.userId;
        // Save the frontend data into the existing Prisma schema fields
        const newPost = await prisma.boardPost.create({
            data: {
                looking: title, // Saving 'title' into 'looking'
                offering: category, // Saving 'category' into 'offering'
                description: content, // Saving 'content' into 'description'
                author: { connect: { id: userId } }
            },
            include: {
                author: { select: { name: true, avatarUrl: true } }
            }
        });
        res.status(201).json({ message: "Post created successfully", post: newPost });
    }
    catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ error: "Failed to create board post." });
    }
});
exports.default = router;
