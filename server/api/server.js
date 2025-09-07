require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("../database");
const crypto = require("crypto");

const app = express();

app.use(
  cors({
    origin: [
      "https://car-invoicing-client.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());

// models
require("../models/User");

// routes
app.get("/", (req, res) => res.send("Car Invoicing API is running"));
app.get("/health", (req, res) => res.json({ ok: true }));
app.get(["/favicon.ico", "/favicon.png"], (req, res) => res.status(204).end());

app.use("/auth", require("../routes/authRoutes"));
app.use("/user", require("../routes/userRoutes"));
app.use("/template", require("../routes/templateRoutes"));
app.use("/invoice", require("../routes/invoiceRoutes"));
app.use("/ocr", require("../routes/ocrRoutes"));

// cloudinary signature (unchanged)
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
app.post("/generate-signature", (req, res) => {
  try {
    const { timestamp } = req.body;
    if (!timestamp)
      return res.status(400).json({ error: "Timestamp is required" });
    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
      .digest("hex");
    res.json({ signature });
  } catch {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

connectDB().catch((err) => console.error("MongoDB connection error:", err));

module.exports = (req, res) => app(req, res);
