import express from "express"
import { register, login, logout, getProfile, createBio, updateBio } from "../controller/auth.controller.js"
import upload from "../middleware/upload.middleware.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/register").post(upload.single("image"), register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/profile").get(protect, getProfile)

router.route("/create-bio").post(protect, createBio)
router.route("/update-bio").put(protect, updateBio)

export default router