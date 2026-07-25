const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({
  userId: String,
  ip: String,
  device: String,
}, { timestamps: true });

module.exports = mongoose.model("LoginActivity", loginActivitySchema);