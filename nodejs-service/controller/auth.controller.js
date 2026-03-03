import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import { generateToken } from "../config/generateToken.js";
import imagekit from "../config/imagekit.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Profile image is required", success: false });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const uploadResponse = await imagekit.upload({
    file: req.file.buffer,
    fileName: req.file.originalname,
    folder: "/circlo/users",
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      imageUrl: uploadResponse.url,
      imageUrlID: uploadResponse.fileId,
    },
  });

  const token = generateToken(user.id);

  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = generateToken(user.id);

  res.status(200).json({ user, token });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
});


export const 