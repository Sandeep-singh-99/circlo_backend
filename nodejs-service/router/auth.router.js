import express from "express"
import { register, login, logout, getProfile } from "../controller/auth.controller.js"
import upload from "../middleware/upload.middleware.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/register").post(upload.single("image"), register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/profile").get(protect, getProfile)

export default router