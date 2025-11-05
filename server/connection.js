const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB conectado");
  } catch (err) {
    console.error("Error conectando MongoDB:", err);
    process.exit(1);
  }
}

module.exports = connectDB;