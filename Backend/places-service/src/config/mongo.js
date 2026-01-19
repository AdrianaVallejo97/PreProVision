const mongoose = require("mongoose");

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);

  console.log("MongoDB connected");
}

module.exports = { connectMongo };
