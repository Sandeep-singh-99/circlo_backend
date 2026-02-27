import express from 'express';
import protect from '../middleware/authMiddleware.js';
import { toggleBookmark } from '../controller/bookmark.controller.js';

const router = express.Router();

router.route("/toggle/:id").post(protect, toggleBookmark);

export default router;