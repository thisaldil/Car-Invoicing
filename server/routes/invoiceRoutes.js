const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const ticketController = require("../controllers/ticketController");
const authRequired = require("../middlewares/authRequired");
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// All routes now protected with authRequired middleware
router.post(
  "/upload-ticket",
  authRequired,
  upload.single("ticket"),
  ticketController.extractTicketData
);
router.post(
  "/upload",
  authRequired,
  upload.single("invoice"),
  invoiceController.uploadInvoice
);
router.post(
  "/sendInvoiceEmail",
  authRequired,
  invoiceController.sendInvoiceEmail
);
router.post(
  "/saveInvoiceDetails",
  authRequired,
  invoiceController.saveInvoiceDetails
);
router.post(
  "/saveCarInvoiceDetails",
  authRequired,
  invoiceController.saveCarInvoiceDetails
);
router.get(
  "/getInvoiceDetailsByUserId/:userId",
  authRequired,
  invoiceController.getInvoiceDetailsByUserId
);
router.get(
  "/getInvoiceDetailsByInvoiceId/:invoiceId",
  authRequired,
  invoiceController.getInvoiceDetailsByInvoiceId
);
router.delete(
  "/deleteInvoice/:invoiceId",
  authRequired,
  invoiceController.deleteInvoice
);
router.get("/recent", authRequired, invoiceController.getRecentInvoices);

// Get this month's invoices
// router.get("/month", ensureLoggedIn(), invoiceController.getMonthlyInvoices);

// // Get this month's total revenue
// router.get(
//   "/month/revenue",
//   ensureLoggedIn(),
//   invoiceController.getMonthlyRevenue
// );

// Example list route (protected)
router.get("/list", authRequired, async (req, res) => {
  // TODO: replace with real query, e.g. Invoice.find({ owner: req.userId })
  return res.json({ invoices: [] });
});

module.exports = router;
