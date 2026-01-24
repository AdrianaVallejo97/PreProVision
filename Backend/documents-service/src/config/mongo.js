const mongoose = require("mongoose");

async function connectMongo() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

module.exports = { connectMongo };
