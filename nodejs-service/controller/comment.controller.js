import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addComment = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const { content, parentId } = req.body; // parentId optional
    const userId = req.user.id;

    if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const comment = await prisma.$transaction(async (tx) => {

        const newComment = await tx.comment.create({
            data: {
                content,
                userId,
                postId,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true
                    }
                }
            }
        });

        // If reply → increment replyCount
        if (parentId) {
            await tx.comment.update({
                where: { id: parentId },
                data: {
                    replyCount: { increment: 1 }
                }
            });
        }

        return newComment;
    });

    res.status(201).json({
        message: "Comment added",
        comment
    });
});


export const getPostComments = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
        where: {
            postId,
            parentId: null
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true
                }
            },
            likes: {
                where: { userId },
                select: { id: true }
            }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
    });

    const formatted = comments.map(comment => ({
        ...comment,
        isLikedByCurrentUser: comment.likes.length > 0,
        likes: undefined
    }));

    res.json(formatted);
});

export const getReplies = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    const replies = await prisma.comment.findMany({
        where: {
            parentId: commentId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true
                }
            },
            likes: {
                where: { userId },
                select: { id: true }
            }
        },
        orderBy: { createdAt: "asc" }
    });

    const formatted = replies.map(reply => ({
        ...reply,
        isLikedByCurrentUser: reply.likes.length > 0,
        likes: undefined
    }));

    res.json(formatted);
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    const existingLike = await prisma.commentLike.findUnique({
        where: {
            userId_commentId: {
                userId,
                commentId
            }
        }
    });

    if (existingLike) {
        await prisma.$transaction([
            prisma.commentLike.delete({
                where: {
                    userId_commentId: {
                        userId,
                        commentId
                    }
                }
            }),
            prisma.comment.update({
                where: { id: commentId },
                data: { likeCount: { decrement: 1 } }
            })
        ]);

        return res.json({ message: "Comment unliked" });
    }

    await prisma.$transaction([
        prisma.commentLike.create({
            data: { userId, commentId }
        }),
        prisma.comment.update({
            where: { id: commentId },
            data: { likeCount: { increment: 1 } }
        })
    ]);

    res.json({ message: "Comment liked" });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.$transaction(async (tx) => {

        if (comment.parentId) {
            await tx.comment.update({
                where: { id: comment.parentId },
                data: { replyCount: { decrement: 1 } }
            });
        }

        await tx.comment.delete({
            where: { id: commentId }
        });
    });

    res.json({ message: "Comment deleted" });
});


export const updateComment = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized" });
    }

    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
            content: content.trim()
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true
                }
            }
        }
    });

    res.json({
        message: "Comment updated",
        comment: updatedComment
    });
});
