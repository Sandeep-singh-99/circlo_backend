import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { addComment, deleteComment, getPostComments, getReplies, toggleCommentLike, updateComment } from '../controller/comment.controller.js';

const router = express.Router();

router.route("/:id").post(protect, addComment);
router.route("/:id").get(protect, getPostComments);
router.route("/:id").delete(protect, deleteComment);
router.route("/:id").put(protect, updateComment);

router.route("/reply/:id").get(protect, getReplies);

router.route("/comment-like/:id").post(protect, toggleCommentLike);

export default router;