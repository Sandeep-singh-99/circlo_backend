import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleRepost = asyncHandler(async (req, res) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return res.status(404).json({
      message: "Post not found",
    });
  }

  // Check if repost already exists
  const existingRepost = await prisma.rePost.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  let message;

  if (existingRepost) {
    // 🔹 Unrepost
    await prisma.rePost.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    message = "Repost removed";
  } else {
    // 🔹 Create repost
    await prisma.rePost.create({
      data: {
        userId,
        postId,
      },
    });

    message = "Post reposted";
  }

  // Get updated repost count
  const repostCount = await prisma.rePost.count({
    where: { postId },
  });

  res.status(200).json({
    message,
    repostCount,
  });
});

export const getReposts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const reposts = await prisma.rePost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }, // newest first
    include: {
      post: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              rePosts: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json({ reposts });
});