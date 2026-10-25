import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/dashboard-data", async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    
    const activeSwaps = await prisma.swap.count({
      where: {
        status: {
          in: ["PENDING_AGREEMENT", "CONFIRMED", "ACCEPTED"]
        }
      }
    });

    const completedSwaps = await prisma.swap.count({
      where: { status: "COMPLETED" }
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true // ADDED THIS LINE!
      }
    });

    res.status(200).json({
      stats: {
        totalUsers,
        activeSwaps,
        completedSwaps,
        reportedIssues: 0 
      },
      recentUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load admin data." });
  }
});

// --- BAN / DELETE USER ---
router.delete("/users/:id", async (req, res): Promise<any> => {
  try {
    const targetUserId = req.params.id;

    // First, check if the user exists and isn't an ADMIN
    const userToBan = await prisma.user.findUnique({ where: { id: targetUserId } });
    
    if (!userToBan) {
      return res.status(404).json({ error: "User not found." });
    }
    
    if (userToBan.role === "ADMIN") {
      return res.status(403).json({ error: "Cannot ban another admin." });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: targetUserId }
    });

    res.status(200).json({ message: "User successfully banned and removed." });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({ error: "Failed to ban user. They might have tied records (swaps/reviews) that need deleting first." });
  }
}); 

export default router;