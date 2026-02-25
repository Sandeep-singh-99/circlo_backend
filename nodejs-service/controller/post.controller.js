import imagekit from "../config/imagekit.js";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const extractHashtags = (text) => {
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches
    ? [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))]
    : [];
};

export const createPost = asyncHandler(async (req, res) => {
  const { content, imageUrl } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  // 1️⃣ Extract hashtags
  const hashtags = extractHashtags(content);

  const uploadResponse = await imagekit.upload({
    file: req.file.buffer,
    fileName: req.file.originalname,
    folder: "/circlo/posts",
  })

  // 2️⃣ Create post first
  const post = await prisma.post.create({
    data: {
      content,
      imageUrl: uploadResponse.url,
      imageUrlID: uploadResponse.fileId,
      userId: req.user.id,
    },
  });

  // 3️⃣ Handle hashtags
  for (const tag of hashtags) {
    const hashtag = await prisma.hashtag.upsert({
      where: { name: tag },
      update: { usageCount: { increment: 1 } },
      create: { name: tag, usageCount: 1 },
    });

    await prisma.postHashtag.create({
      data: {
        postId: post.id,
        hashtagId: hashtag.id,
      },
    });
  }

  res.status(201).json({ post });
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      user: true,
      hashtags: {
        include: {
          hashtag: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ posts });
});

export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: true,
      hashtags: {
        include: {
          hashtag: true,
        },
      },
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json({ post });
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, imageUrl } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      hashtags: {
        include: { hashtag: true },
      },
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.userId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const newHashtags = extractHashtags(content);
  const oldHashtags = post.hashtags.map(h => h.hashtag.name);

  await prisma.$transaction(async (tx) => {

    // 1️⃣ Update post content
    await tx.post.update({
      where: { id },
      data: {
        content,
        imageUrl,
      },
    });

    // 2️⃣ Remove old hashtag relations
    for (const tag of oldHashtags) {
      if (!newHashtags.includes(tag)) {
        const hashtag = await tx.hashtag.findUnique({
          where: { name: tag },
        });

        if (hashtag) {
          await tx.postHashtag.delete({
            where: {
              postId_hashtagId: {
                postId: id,
                hashtagId: hashtag.id,
              },
            },
          });

          await tx.hashtag.update({
            where: { id: hashtag.id },
            data: { usageCount: { decrement: 1 } },
          });
        }
      }
    }

    // 3️⃣ Add new hashtags
    for (const tag of newHashtags) {
      if (!oldHashtags.includes(tag)) {
        const hashtag = await tx.hashtag.upsert({
          where: { name: tag },
          update: { usageCount: { increment: 1 } },
          create: { name: tag, usageCount: 1 },
        });

        await tx.postHashtag.create({
          data: {
            postId: id,
            hashtagId: hashtag.id,
          },
        });
      }
    }
  });

  res.json({ message: "Post updated successfully" });
});

export const getOwnPosts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const posts = await prisma.post.findMany({
    where: { userId },
    include: {
      hashtags: {
        include: {
          hashtag: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ posts });
})

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      hashtags: {
        include: { hashtag: true },
      },
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.userId !== req.user.id) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Delete image from ImageKit
  if (post.imageUrlID) {
    await imagekit.deleteFile(post.imageUrlID);
  }

  await prisma.$transaction(async (tx) => {
    // Delete hashtag associations
    for (const { hashtag } of post.hashtags) {
      await tx.postHashtag.delete({
        where: {
          postId_hashtagId: {
            postId: id,
            hashtagId: hashtag.id,
          },
        },
      });

      await tx.hashtag.update({
        where: { id: hashtag.id },
        data: { usageCount: { decrement: 1 } },
      });
    }

    // Delete post
    await tx.post.delete({
      where: { id },
    });
  });

  res.json({ message: "Post deleted successfully" });
});
