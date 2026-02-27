import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const toggleBookmark = asyncHandler(async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Check post exists
    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    try {
        // 2️⃣ Try creating bookmark
        await prisma.bookmark.create({
            data: { userId, postId }
        });

        return res.json({
            bookmarked: true,
            message: "Post bookmarked"
        });

    } catch (error) {

        // 3️⃣ If already bookmarked → remove it
        await prisma.bookmark.delete({
            where: {
                userId_postId: { userId, postId }
            }
        });

        return res.json({
            bookmarked: false,
            message: "Bookmark removed"
        });
    }
});