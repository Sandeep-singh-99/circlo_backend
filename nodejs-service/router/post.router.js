import express from 'express'
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.middleware.js';
import { videoUpload } from '../controller/vPost.controller.js';

const router = express.Router();

router.route("/upload-video").post(protect, upload.single("video"), videoUpload)

export default router;