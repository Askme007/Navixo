import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Ensure import ends in .js
import platformRoutes from "./routes/platform.routes.js";

dotenv.config();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use("/api/platforms", platformRoutes);

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
