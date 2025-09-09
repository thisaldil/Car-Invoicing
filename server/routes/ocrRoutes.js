const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { handleOCR } = require("../controllers/ocrController");
const authRequired = require("../middlewares/authRequired");

const router = express.Router();
const uploadDir = "/tmp/uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post("/analyze", authRequired, upload.single("ticket"), handleOCR);

module.exports = router;
