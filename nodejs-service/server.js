import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

import authRouter from "./router/auth.router.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
