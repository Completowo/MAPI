import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  text: { type: String, required: true },
  sender: { type: String, enum: ["user", "assistant"], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model("Message", messageSchema);