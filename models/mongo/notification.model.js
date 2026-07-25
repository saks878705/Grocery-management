const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: String,
  type: {
    type: String,
    enum: ["LOW_STOCK", "ORDER_CREATED", "ORDER_READY", "ORDER_UPDATED", "ISSUE"],
  },
  userType: {
    type: String,
    enum: ["ADMIN", "CUSTOMER"],
  },
  message: String,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);