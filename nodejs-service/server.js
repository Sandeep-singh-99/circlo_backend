import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.get("/", (req, res) => {
  res.json({ message: "Node.js running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
