import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import swapRoutes from "./routes/swaps"; 
import boardRoutes from "./routes/board";
import chatRoutes from "./routes/chat";
import analyticsRoutes from "./routes/analytics";
import adminRoutes from "./routes/admin";
import forumRoutes from "./routes/forum";
import { authenticateToken } from "./middleware/authMiddleware";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
// INCREASE PAYLOAD LIMIT for base64 images
app.use(express.json({ limit: '10mb' }));

// --- THE BULLETPROOF PROFILE UPDATE BYPASS ---
// Placed at the root level to guarantee route registration
app.put("/api/profile/update", authenticateToken, async (req: any, res: any) => {
  console.log("✅ SUCCESS: The backend received the profile update request!");
  
  try {
    const { name, bio, gender, avatarUrl } = req.body;
    const userId = req.user?.id || req.userId;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ? String(name) : undefined,
        bio: bio !== undefined ? String(bio) : undefined,
        gender: gender ? String(gender) : undefined,
        avatarUrl: avatarUrl ? String(avatarUrl) : undefined,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        gender: updatedUser.gender,
      }
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json( {error: "Failed to update profile." });
  }
});

// --- 1. LEADERBOARD: LIVE RATING AGGREGATION ---
app.get("/api/leaderboard", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    const allUsers = await prisma.user.findMany({
      include: { 
        offeredSkills: { select: { name: true }, take: 2 },
        reviewsReceived: { select: { rating: true } } 
      }
    });
    
    const formattedData = allUsers.map((user) => {
      const totalReviews = user.reviewsReceived.length;
      const avgRating = totalReviews > 0 
        ? user.reviewsReceived.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews 
        : 0;

      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl, // ADDED AVATAR
        skills: user.offeredSkills.map(s => s.name).join(", ") || "Member",
        rating: avgRating.toFixed(1),
        reviews: totalReviews,
        isCurrentUser: user.id === userId
      };
    }).sort((a, b) => Number(b.rating) - Number(a.rating));

    res.json({ topMentors: formattedData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// --- 1.5 LEADERBOARD: MOST SWAPS AGGREGATION ---
app.get("/api/leaderboard/swaps", authenticateToken, async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany({
      include: {
        swapsRequested: { where: { status: "COMPLETED" } },
        swapsReceived: { where: { status: "COMPLETED" } },
      }
    });

    const formattedData = allUsers.map((user) => {
      const totalSwaps = user.swapsRequested.length + user.swapsReceived.length;
      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl, // ADDED AVATAR
        totalSwaps: totalSwaps
      };
    }).sort((a, b) => b.totalSwaps - a.totalSwaps);

    res.json(formattedData);
  } catch (error) {
    console.error("Swaps Leaderboard Aggregation Error:", error);
    res.status(500).json({ error: "Failed to compile swap activity metrics." });
  }
});

// --- 2. MATCHING RADAR: MUTUAL SKILL MATCHING ---
app.get("/api/matches", authenticateToken, async (req, res) => {
  const userId = (req as any).user?.id || (req as any).userId;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        offeredSkills: { select: { id: true } },
        wantedSkills: { select: { id: true } }
      }
    });

    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const myOfferedIds = currentUser.offeredSkills.map(s => s.id);
    const myWantedIds = currentUser.wantedSkills.map(s => s.id);

    const activeSwaps = await prisma.swap.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
        NOT: { status: "COMPLETED" } 
      },
      select: { requesterId: true, receiverId: true }
    });

    const excludedIds = activeSwaps.flatMap(s => 
      s.requesterId === userId ? [s.receiverId] : [s.requesterId]
    );
    excludedIds.push(userId);

    const recommendedPeers = await prisma.user.findMany({
      where: { 
        id: { notIn: excludedIds },
        offeredSkills: {
          some: { id: { in: myWantedIds } } 
        },
        wantedSkills: {
          some: { id: { in: myOfferedIds } } 
        }
      },
      include: {
        offeredSkills: { select: { id: true, name: true } },
        wantedSkills: { select: { id: true, name: true } }
      },
      take: 6
    });

    // Note: Because we use 'include' above, prisma naturally returns all scalars, so avatarUrl and bio are automatically included here!
    res.json(recommendedPeers);
  } catch (error) {
    console.error("Radar Error:", error);
    res.status(500).json({ error: "Radar fetch error" });
  }
});

// --- 3. SWAP REQUEST HANDLERS ---
app.post("/api/swaps/request", authenticateToken, async (req, res) => {
  const { receiverId, offeredSkillId, wantedSkillId } = req.body;
  const requesterId = (req as any).user?.id || (req as any).userId;

  try {
    await prisma.swap.create({
      data: {
        status: "PENDING_AGREEMENT",
        sessions: 5,
        requester: { connect: { id: requesterId } },
        receiver: { connect: { id: receiverId } },
        offeredSkill: { connect: { id: offeredSkillId } },
        wantedSkill: { connect: { id: wantedSkillId } },
      }
    });

    const newRequest = await prisma.swapRequest.create({
      data: {
        status: "PENDING", 
        requester: { connect: { id: requesterId } },
        receiver: { connect: { id: receiverId } },
        offeredSkill: { connect: { id: offeredSkillId } },
        wantedSkill: { connect: { id: wantedSkillId } },
      }
    });

    res.status(201).json(newRequest);
  } catch (error: any) {
    console.error("DEBUG REQUEST ERROR:", error.message);
    res.status(500).json({ error: "Check if IDs exist in DB." });
  }
});

app.get("/api/swap-requests", authenticateToken, async (req, res) => {
  const userId = (req as any).user?.id || (req as any).userId;

  try {
    const requests = await prisma.swapRequest.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { requesterId: userId }
        ]
      },
      include: {
        // ADDED AVATAR
        requester: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        offeredSkill: { select: { name: true } }, 
        wantedSkill: { select: { name: true } }   
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

app.patch("/api/swap-requests/:id/status", authenticateToken, async (req, res) => {
  const id = req.params.id as string;
  const { newStatus } = req.body;

  try {
    const updatedRequest = await prisma.swapRequest.update({
      where: { id },
      data: { status: newStatus },
    });

    if (newStatus === "ACCEPTED") {
      const relatedSwap = await prisma.swap.findFirst({
        where: {
          requesterId: updatedRequest.requesterId,
          receiverId: updatedRequest.receiverId,
          offeredSkillId: updatedRequest.offeredSkillId,
          wantedSkillId: updatedRequest.wantedSkillId,
          status: "PENDING_AGREEMENT"
        }
      });

      if (relatedSwap) {
        return res.json({ ...updatedRequest, redirectId: relatedSwap.id });
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// --- 4. SWAP MANAGEMENT & BILATERAL LOGGING ---
app.get("/api/swaps", authenticateToken, async (req, res) => {
  const userId = (req as any).user?.id || (req as any).userId;
  try {
    const swaps = await prisma.swap.findMany({
      where: { OR: [{ requesterId: userId }, { receiverId: userId }] },
      include: {
        // ADDED AVATAR
        requester: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        offeredSkill: { select: { name: true } },
        wantedSkill: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch swaps" });
  }
});

// Fetching avatarUrl and bio for the Swap Agreement Page
app.get("/api/swaps/:id", authenticateToken, async (req, res: any) => {
  const swapId = req.params.id as string;
  const userId = (req as any).user?.id || (req as any).userId;
  
  try {
    const swap = await prisma.swap.findUnique({
      where: { id: swapId },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true, bio: true } },
        offeredSkill: true, 
        wantedSkill: true,
      },
    }) as any;

    if (!swap) return res.status(404).json({ message: "Swap not found" });

    const isRequester = swap.requesterId === userId;
    const me = isRequester ? swap.requester : swap.receiver;
    const partner = isRequester ? swap.receiver : swap.requester;

    res.json({ 
      ...swap, 
      me: me,
      partner: partner 
    });

  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.post("/api/swaps/:id/log-session", authenticateToken, async (req, res) => {
  const id = req.params.id as string;
  const userId = (req as any).user?.id || (req as any).userId;

  try {
    const swap = await prisma.swap.findUnique({ where: { id } });
    if (!swap) return res.status(404).json({ error: "Swap not found" });

    const isRequester = swap.requesterId === userId;
    const currentCount = isRequester ? swap.requesterSessions : swap.receiverSessions;

    if (currentCount >= swap.sessions) {
      return res.status(400).json({ error: "Session validation limit reached for this user." });
    }

    const updatedSwap = await prisma.swap.update({
      where: { id },
      data: isRequester 
        ? { requesterSessions: currentCount + 1 } 
        : { receiverSessions: currentCount + 1 }
    });

    res.json(updatedSwap);
  } catch (error) {
    res.status(500).json({ error: "Failed to log verification session." });
  }
});

// --- 5. FINALIZE AGREEMENT ---
app.post("/api/swaps/:id/agreement", authenticateToken, async (req, res) => {
  const id = req.params.id as string;
  const { sessions } = req.body;

  try {
    const updatedSwap = await prisma.swap.update({
      where: { id },
      data: {
        sessions: Number(sessions),
        status: "CONFIRMED", 
      }
    });

    res.json({ 
      message: "Agreement finalized!", 
      swap: updatedSwap 
    });
  } catch (error: any) {
    console.error("Agreement Error:", error.message);
    res.status(500).json({ error: "Failed to save agreement." });
  }
});

// --- 6. REPUTATION & BILATERAL FINALIZATION ---
app.post("/api/reputation/submit", authenticateToken, async (req, res) => {
  const { swapId, partnerId, rating, comment } = req.body;
  const reviewerId = (req as any).user?.id || (req as any).userId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Log the individual review
      const newReview = await tx.review.create({
        data: {
          rating: Number(rating),
          comment: comment || "",
          reviewer: { connect: { id: reviewerId } },
          reviewee: { connect: { id: partnerId } },
          swap: { connect: { id: swapId } }
        }
      });

      // 2. Count existing reviews for this specific swap
      const totalReviews = await tx.review.count({ where: { swapId } });

      // 3. Mark completed ONLY if both peers have submitted evaluations
      if (totalReviews >= 2) {
        await tx.swap.update({ 
          where: { id: swapId }, 
          data: { status: "COMPLETED" } 
        });
      }
      
      return newReview;
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 7. DELETION & CANCELLATION ---
app.delete("/api/swaps/cancel/:type/:id", authenticateToken, async (req, res) => {
  const type = req.params.type as string; 
  const id = req.params.id as string; 

  try {
    if (type === "request") {
      await prisma.swapRequest.delete({ where: { id } });
    } else {
      await prisma.swap.delete({ where: { id } });
    }
    res.json({ message: "Cancelled successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Record not found or already deleted" });
  }
});

// --- EXTERNAL ROUTE DELEGATION ---
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forum", forumRoutes);

app.use((err: any, req: any, res: any, next: any) => {
  console.error("SERVER CRASHED:", err.stack);
  res.status(500).send('Something broke!');
});

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Knoxite Server Live on Port ${PORT}`);

});
  server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port!`);
  } else {
    console.error('❌ Server error:', error);
  }
});