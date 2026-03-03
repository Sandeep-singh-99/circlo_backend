import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getReposts, toggleRepost } from "../controller/repost.controller.js";

const router = express.Router();

router.route("/toggle/:id").post(protect, toggleRepost);

router.route("/get-reposts").get(protect, getReposts);

export default router;