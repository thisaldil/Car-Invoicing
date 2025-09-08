const router = require("express").Router();
const {
  handleGoogleToken,
  handleGoogleRegister,
} = require("../controllers/authController");

router.post("/google/token", handleGoogleToken);
router.post("/google/register", handleGoogleRegister);

module.exports = router;
