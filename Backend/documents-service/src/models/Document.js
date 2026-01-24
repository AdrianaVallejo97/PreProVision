const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    // quién subió (ADMIN)
    uploaderUserId: { type: String, required: true },

    // a quién pertenece (STUDENT)
   targetUserId: { type: String, default: null, index: true },

    // PLACE o AGREEMENT
    kind: { type: String, enum: ["PLACE", "AGREEMENT"], required: true, index: true },

    // id del place o agreement
    entityId: { type: String, required: true, index: true },

    // path en Supabase Storage
    path: { type: String, required: true, unique: true },

    // nombre original del archivo
    originalName: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", DocumentSchema);
