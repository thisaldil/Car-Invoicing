require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("../database");
const crypto = require("crypto");

const app = express();

// CORS for your frontend
app.use(
  cors({
    origin: "https://car-invoicing-client.vercel.app",
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());

// models and passport
require("../models/User");
require("../services/passport");

// routes
const authRoutes = require("../routes/authRoutes");
const userRoutes = require("../routes/userRoutes");
const templateRoutes = require("../routes/templateRoutes");
const invoiceRoutes = require("../routes/invoiceRoutes");
const ocrRoutes = require("../routes/ocrRoutes");

// basic routes so / and /health work
app.get("/", (req, res) => res.send("Car Invoicing API is running"));
app.get("/health", (req, res) => res.json({ ok: true }));

// stop favicon noise in logs
app.get(["/favicon.ico", "/favicon.png"], (req, res) => res.status(204).end());

// mount feature routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/template", templateRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/ocr", ocrRoutes);

// cloudinary signature
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

// connect DB once at cold start
connectDB().catch((err) => {
  console.error("MongoDB connection error:", err);
});

// export Express handler for Vercel
module.exports = (req, res) => app(req, res);
