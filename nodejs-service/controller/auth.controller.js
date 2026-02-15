import prisma from "../config/prisma"
import { asyncHandler } from "../utils/asyncHandler"
import bcrypt from "bcrypt"
import { generateToken } from "../config/generateToken"

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, imageUrl } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
    }

    if (!req.file) {
        return res.status(400).json({ message: "Profile image is required", success: false})
    }

    const hashedPassword = await bcrypt.hash(password, 10)


})