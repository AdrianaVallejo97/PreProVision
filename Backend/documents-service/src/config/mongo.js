const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("Missing MONGO_URI in .env");

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = { connectMongo };
