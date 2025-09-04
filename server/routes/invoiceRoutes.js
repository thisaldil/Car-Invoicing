const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const invoiceController = require("../controllers/invoiceController");
const ticketController = require("../controllers/ticketController");

// Minimal auth guard: returns 401 if req.user is missing.
// Replace this later with your real auth (JWT or Passport) that sets req.user.
function ensureLoggedIn() {
  return (req, res, next) => {
    if (req.user && req.user._id) return next();
    return res.status(401).json({ error: "Unauthorized" });
  };
}

// Use /tmp/uploads for Vercel compatibility
const uploadDir = "/tmp/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Routes
router.post(
  "/upload-ticket",
  upload.single("ticket"),
  ticketController.extractTicketData
);

router.post(
  "/upload",
  upload.single("invoice"),
  invoiceController.uploadInvoice
);

router.post("/sendInvoiceEmail", invoiceController.sendInvoiceEmail);
router.post("/saveInvoiceDetails", invoiceController.saveInvoiceDetails);

router.get(
  "/getInvoiceDetailsByUserId/:userId",
  invoiceController.getInvoiceDetailsByUserId
);

router.get(
  "/getInvoiceDetailsByInvoiceId/:invoiceId",
  invoiceController.getInvoiceDetailsByInvoiceId
);

router.delete("/deleteInvoice/:invoiceId", invoiceController.deleteInvoice);

// Matches your controller export name
router.get("/recent", invoiceController.getRecentInvoices);

// Monthly endpoints guarded; will 401 if req.user is not set by your auth
router.get("/month", ensureLoggedIn(), invoiceController.getMonthlyInvoices);
router.get(
  "/month/revenue",
  ensureLoggedIn(),
  invoiceController.getMonthlyRevenue
);

module.exports = router;
