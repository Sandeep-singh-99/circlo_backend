import prisma from "../config/prisma.js";
import imagekit from "../config/imagekit.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Readable } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath);

const getVideoDuration = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    ffmpeg(stream).ffprobe((err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
};

export const videoUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Video file is required" });
  }

  // 1️⃣ Check duration
  const duration = await getVideoDuration(req.file.buffer);

  if (duration > 90) {
    return res.status(400).json({
      message: "Video must be 1 minute 30 seconds or less",
    });
  }

  // 2️⃣ Upload to ImageKit
  const uploaded = await imagekit.upload({
    file: req.file.buffer,
    fileName: `reels-${Date.now()}.mp4`,
    folder: "/circlo/videos",
  });

  // 3️⃣ Save in DB
  const post = await prisma.post.create({
    data: {
      content: req.body.content || "",
      videoUrl: uploaded.url,
      videoUrlID: uploaded.fileId,
      userId: req.user.id,
    },
  });

  res.status(201).json({
    message: "Video uploaded successfully",
    post,
  });
});