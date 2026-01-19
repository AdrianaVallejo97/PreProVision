const mongoose = require("mongoose");

const QuotaSchema = new mongoose.Schema(
  {
    placeId: { type: String, required: true, unique: true }, // MongoId string
    capacity: { type: Number, required: true, min: 0 },
    used: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

// Virtual (no se guarda en DB)
QuotaSchema.virtual("available").get(function () {
  return Math.max(0, (this.capacity || 0) - (this.used || 0));
});

module.exports = mongoose.model("Quota", QuotaSchema);
