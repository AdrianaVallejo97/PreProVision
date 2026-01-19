const mongoose = require("mongoose");

const AgreementSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },     // UUID (user-service)
    placeId: { type: String, required: true },    // MongoId (places-service)
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agreement", AgreementSchema);
