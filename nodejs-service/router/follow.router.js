import express from "express";
import protect from "../middleware/authMiddleware.js";
import { followUnfollowUser, getFollowers, getFollowing } from "../controller/follow.controller.js";

const router = express.Router();

router.route("/follow/:userId")
  .post(protect, followUnfollowUser);

router.route("/followers/:userId")
  .get(getFollowers);

router.route("/following/:userId")
  .get(getFollowing);

export default router; 