import prisma from "../config/prisma.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"
import { generateToken } from "../config/generateToken.js"
import { uploadImage } from "../utils/upload.image.js"

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, imageUrl } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" })
    }

    if (!req.file) {
        return res.status(400).json({ message: "Profile image is required", success: false})
    }

    const image = await uploadImage(imageUrl, "image")

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            imageUrl: image.secure_url,
        }
    })

    const token = generateToken(user.id)

    res.status(201).json({ user, token })
})