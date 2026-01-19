const mongoose = require("mongoose");

const AgreementSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    placeId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"], default: "PENDING" },

    // opcional: para auditoría/fechas
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    cancelledAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agreement", AgreementSchema);
