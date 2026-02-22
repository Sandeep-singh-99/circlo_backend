import express from 'express'
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.middleware.js';
import { videoUpload } from '../controller/vPost.controller.js';
import { createPost, deletePost, getAllPosts, getPostById } from '../controller/post.controller.js';

const router = express.Router();

router.route("/create-post").post(protect, upload.single("image"), createPost);
router.route("/get-all-posts").get(protect, getAllPosts);
router.route("/get-post-byID/:id").get(protect, getPostById);
router.route("/delete/:id").delete(protect, deletePost);

router.route("/upload-video").post(protect, upload.single("video"), videoUpload);

export default router;