const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // USER_CREATED, AGREEMENT_APPROVED
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
