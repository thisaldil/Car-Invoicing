const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// keep the same env var name you’re using on the server
const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const createUser = async (payload) => {
  const googleId = payload.sub;
  const imageUrl = payload.picture;

  const user = new User({
    googleId,
    name: payload.name,
    email: payload.email,
    picture: imageUrl,
  });

  await user.save();
  return user;
};

const handleGoogleRedirect = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  await User.findByIdAndUpdate(req.user._id, { token });

  return res
    .status(200)
    .json({ message: "Authentication successful", user: req.user, token });
};

const handleGoogleToken = async (req, res) => {
  try {
    // same request shape: { token }
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    // use the same env var you chose
    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Internal Server Error" }); // keep message style
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;

    const user = await User.findOne({ googleId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    await User.findByIdAndUpdate(user._id, { token: jwtToken });

    return res.status(200).json({
      message: "Authentication successful",
      user: {
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      token: jwtToken,
      userId: user._id,
    });
  } catch (error) {
    // invalid / expired id_token should be 401, not 500
    console.error("Google Token Handling Error:", error?.message || error);
    return res.status(401).json({ message: "Internal Server Error" }); // message preserved
  }
};

const handleGoogleRegister = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // same checks, same messages
    const existingUser = await User.findOne({ googleId: payload.sub });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // avoid duplicate key on email if unique index exists
    const existingByEmail = await User.findOne({ email: payload.email });
    if (existingByEmail) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await createUser({
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    });

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    await User.findByIdAndUpdate(user._id, { token: jwtToken });

    return res.status(200).json({
      message: "Registration successful",
      user: {
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      token: jwtToken,
      userId: user._id,
    });
  } catch (error) {
    // send 409 if Mongo throws duplicate key anyway
    if (error?.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    console.error("Google Register Error:", error?.message || error);
    return res.status(401).json({ message: "Internal Server Error" }); // keep message format
  }
};

module.exports = {
  handleGoogleRedirect,
  handleGoogleToken,
  handleGoogleRegister,
  createUser,
};
