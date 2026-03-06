import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const followUnfollowUser = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;
  const { userId } = req.params; // user to follow

  if (currentUserId === userId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userId
      }
    }
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id }
    });

    return res.json({
      message: "Unfollowed successfully"
    });
  }

  await prisma.follow.create({
    data: {
      followerId: currentUserId,
      followingId: userId
    }
  });

  res.json({
    message: "Followed successfully"
  });
});


export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const followers = await prisma.follow.findMany({
    where: {
      followingId: userId
    },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({
    count: followers.length,
    followers: followers.map(f => f.follower)
  });
}); 


export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const following = await prisma.follow.findMany({
    where: {
      followerId: userId
    },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  res.json({
    count: following.length,
    following: following.map(f => f.following)
  });
});