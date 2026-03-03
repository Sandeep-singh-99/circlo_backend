import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

import authRouter from "./router/auth.router.js";
import postRouter from "./router/post.router.js";
import likeRouter from "./router/like.router.js";
import bookmarkRouter from "./router/bookmark.router.js";
import commentRouter from "./router/comment.router.js";
import repostRouter from "./router/repost.router.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/like", likeRouter);
app.use("/api/bookmark", bookmarkRouter);
app.use("/api/comment", commentRouter);
app.use("/api/repost", repostRouter);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
