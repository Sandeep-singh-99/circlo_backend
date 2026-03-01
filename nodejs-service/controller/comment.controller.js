import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addComment = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Check post exists
    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            userId,
            postId
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

    res.status(201).json({
        message: "Comment added",
        comment
    });
});


export const getPostComments = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;

    const comments = await prisma.comment.findMany({
        where: { postId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    res.json(comments);
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

    await prisma.comment.delete({
        where: { id: commentId }
    });

    res.json({ message: "Comment deleted" });
});


export const updateComment = asyncHandler(async (req, res) => {
    const { id: commentId } = req.params;
    const { content } = req.body;
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

    const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content }
    });

    res.json({
        message: "Comment updated",
        updatedComment
    });
});

export const getTotalComments = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;

    const totalComments = await prisma.comment.count({
        where: { postId }
    });

    res.json({ total: totalComments });
});