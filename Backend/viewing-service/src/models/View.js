const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    entityType: { type: String, enum: ["DOCUMENT", "PLACE", "AGREEMENT"], required: true },
    entityId: { type: String, required: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("View", ViewSchema);
