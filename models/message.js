const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  text: { type: String, required: true },
  sender: { type: String, enum: ["user", "assistant"], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);