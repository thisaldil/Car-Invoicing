const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// -------- add this middleware ----------
const authRequired = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" ");
  if (!token) return res.status(401).json({ message: "missing_token" });
  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = dec.id;
    next();
  } catch {
    return res.status(401).json({ message: "invalid_token" });
  }
};
// ---------------------------------------

router.get("/getUserDetails/:userId", userController.getUserDetails);

// -------- add this route ----------
router.get("/me", authRequired, async (req, res) => {
  const u = await User.findById(req.userId).lean();
  if (!u) return res.status(404).json({ message: "user_not_found" });
  res.json({ user: { name: u.name, email: u.email, picture: u.picture } });
});
// -----------------------------------

// POST /user/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "email_and_password_required" });

    const existing = await User.findOne({ email });
    if (existing && existing.passwordHash) {
      return res.status(409).json({ message: "user_already_exists" });
    }

    let user = existing;
    const hash = await bcrypt.hash(password, 12);

    if (!user) {
      user = await new User({
        name: name || "",
        email,
        passwordHash: hash,
        authProvider: "local",
      }).save();
    } else {
      user.passwordHash = hash;
      user.authProvider = user.googleId ? "both" : "local";
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      message: "ok",
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture,
        googleId: user.googleId,
      },
      userId: user._id,
      token,
    });
  } catch (e) {
    console.error("local register error:", e.message || e);
    res.status(500).json({ message: "internal_error" });
  }
});

// POST /user/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "email_and_password_required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "user_not_found" });

    if (!user.passwordHash) {
      return res.status(409).json({ message: "use_google_or_set_password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "invalid_credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      message: "ok",
      user: {
        name: user.name,
        email: user.email,
        picture: user.picture,
        googleId: user.googleId,
      },
      userId: user._id,
      token,
    });
  } catch (e) {
    console.error("local login error:", e.message || e);
    res.status(500).json({ message: "internal_error" });
  }
});

module.exports = router;
