import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// Send a message
router.post("/send", authenticateToken, async (req: AuthRequest, res: any) => {
  const { receiverId, content, swapId } = req.body; // Added swapId
  const myId = req.userId as string;

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
  } catch (error) {
    console.error("Chat Send Error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get conversation with a specific user for a specific swap
router.get("/conversation/:partnerId", authenticateToken, async (req: AuthRequest, res: any) => {
  const partnerId = req.params.partnerId as string;
  const myId = req.userId as string;
  const { swapId } = req.query; // Get swapId from the URL query parameters

  if (!swapId) {
    return res.status(400).json({ error: "Swap ID query parameter is required." });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        swapId: swapId as string, // CRITICAL: Filters history by this specific rotation only
        OR: [
          { senderId: myId, receiverId: partnerId },
          { senderId: partnerId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("Chat Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;