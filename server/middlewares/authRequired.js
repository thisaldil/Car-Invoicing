// server/api/middleware/authRequired.js
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" ");
  if (!token) return res.status(401).json({ message: "missing_token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "invalid_token" });
  }
};
