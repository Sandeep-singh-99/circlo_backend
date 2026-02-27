import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const likeAndUnlikePost = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;   
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    try {
        await prisma.like.create({
            data: { userId, postId }
        });

        return res.json({ liked: true, message: "Post liked" });

    } catch (error) {
        await prisma.like.delete({
            where: {
                userId_postId: { userId, postId }
            }
        });

        return res.json({ liked: false, message: "Post unliked" });
    }
});