import express from "express";
import dotenv from "dotenv";

dotenv.config();

import authRouter from "./router/auth.router.js"

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json())

app.use("/api/auth", authRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
