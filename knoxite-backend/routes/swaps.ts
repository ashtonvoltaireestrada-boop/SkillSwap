import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// 1. CREATE A NEW SWAP REQUEST
// ==========================================
router.post("/request", authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { receiverId, offeredSkillId, wantedSkillId } = req.body;

    // Security Check: Prevent users from requesting a swap with themselves
    if (req.userId === receiverId) {
      return res.status(400).json({ error: "You cannot initiate a swap with yourself." });
    }

    // Create the transaction in MySQL using your exact 'SwapRequest' model
    const newSwap = await prisma.swapRequest.create({
      data: {
        requesterId: req.userId!, // Matched to your schema!
        receiverId,
        offeredSkillId,
        wantedSkillId,
        status: "PENDING", 
      },
    });

    res.status(201).json({ message: "Swap request sent successfully!", swap: newSwap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error while creating swap request." });
  }
});

// ==========================================
// GET MY ACTIVE SWAPS
// ==========================================
router.get("/", authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const mySwaps = await prisma.swap.findMany({
      where: {
        OR: [
          { requesterId: req.userId },
          { receiverId: req.userId }
        ]
      },
      include: {
        requester: { select: { id: true, name: true, email: true, bio: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, email: true, bio: true, avatarUrl: true } },
        offeredSkill: true,
        wantedSkill: true,
        reviews: true
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(mySwaps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch active swaps." });
  }
});

// ==========================================
// 3. UPDATE SWAP STATUS (Accept / Reject / Complete)
// ==========================================
router.patch("/:swapId/status", authenticateToken, async (req: AuthRequest, res: any) => {
  try {
    const { swapId } = req.params;
    const { newStatus } = req.body; 

    const safeSwapId = String(swapId);

    // 1. Find the existing request
    const existingRequest = await prisma.swapRequest.findUnique({ 
      where: { id: safeSwapId } 
    });

    if (!existingRequest) {
      return res.status(404).json({ error: "Swap request not found." });
    }

    // Auth check
    if ((newStatus === "ACCEPTED" || newStatus === "REJECTED") && existingRequest.receiverId !== req.userId) {
      return res.status(403).json({ error: "You are not authorized to handle this request." });
    }

    // 2. Perform updates
    const result = await prisma.$transaction(async (tx) => {
      // Update the Request status
      const updatedRequest = await tx.swapRequest.update({
        where: { id: safeSwapId },
        data: { status: newStatus },
      });

      // IF ACCEPTED: Create the actual Swap Agreement row
      if (newStatus === "ACCEPTED") {
        const activeSwap = await tx.swap.create({
          data: {
            status: "PENDING_AGREEMENT",
            requesterId: existingRequest.requesterId,
            receiverId: existingRequest.receiverId,
            offeredSkillId: existingRequest.offeredSkillId,
            wantedSkillId: existingRequest.wantedSkillId,
          },
        });
        return { updatedRequest, activeSwap };
      }

      return { updatedRequest };
    });

    res.status(200).json({ 
      message: `Swap marked as ${newStatus}`, 
      swap: result.updatedRequest,
      activeSwapId: (result as any).activeSwap?.id // This is the ID your frontend needs!
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update swap status." });
  }
});

export default router;