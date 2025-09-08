require("dotenv").config();
const express = require("express");
const connectDB = require("../database");
const crypto = require("crypto");

const app = express();

app.use(express.json());

// ---- CORS (handles preflight + all responses) ----
const allowed = new Set([
  "https://car-invoicing-client.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowed.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// models
require("../models/User");

// routes
app.get("/", (_req, res) => res.send("Car Invoicing API is running"));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get(["/favicon.ico", "/favicon.png"], (_req, res) => res.status(204).end());

app.use("/auth", require("../routes/authRoutes"));
app.use("/user", require("../routes/userRoutes"));
app.use("/template", require("../routes/templateRoutes"));
app.use("/invoice", require("../routes/invoiceRoutes"));
app.use("/ocr", require("../routes/ocrRoutes"));

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
connectDB().catch((err) =>
  console.error("MongoDB connection error:", err.message)
);

// Vercel handler
module.exports = (req, res) => app(req, res);
