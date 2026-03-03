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
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      bio: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
          rePosts: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ user });
});

export const createBio = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bio, location, website } = req.body;

  // Check if bio already exists
  const existingBio = await prisma.bio.findUnique({
    where: { userId },
  });

  if (existingBio) {
    return res.status(400).json({
      message: "Bio already exists. Please update instead.",
    });
  }

  const newBio = await prisma.bio.create({
    data: {
      userId,
      bio,
      location,
      website,
    },
  });

  res.status(201).json({
    message: "Bio created successfully",
    bio: newBio,
  });
});

export const updateBio = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { bio, location, website } = req.body;

  const existingBio = await prisma.bio.findUnique({
    where: { userId },
  });

  if (!existingBio) {
    return res.status(404).json({
      message: "Bio not found. Please create first.",
    });
  }

  const updatedBio = await prisma.bio.update({
    where: { userId },
    data: {
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
      ...(website !== undefined && { website }),
    },
  });

  res.status(200).json({
    message: "Bio updated successfully",
    bio: updatedBio,
  });
});
