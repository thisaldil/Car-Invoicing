const router = require("express").Router();
const {
  handleGoogleToken,
  handleGoogleRegister,
} = require("../controllers/authController");

// GIS ID-token login
router.post("/google/token", handleGoogleToken);

// GIS ID-token register (optional)
router.post("/google/register", handleGoogleRegister);

module.exports = router;
