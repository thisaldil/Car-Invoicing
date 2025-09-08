const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  googleId: { type: String, unique: true, sparse: true },
  name: String,
  email: { type: String, unique: true, required: true },
  picture: String,
  token: String,
  passwordHash: String,
  authProvider: {
    type: String,
    enum: ["google", "local", "both"],
    default: "local",
  },
});

module.exports = mongoose.model("User", userSchema);
