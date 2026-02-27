import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { likeAndUnlikePost } from '../controller/like.controller.js';

const router = express.Router();

router.route("/toggle/:id").post(protect, likeAndUnlikePost);

export default router;