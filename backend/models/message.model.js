import mongoose from "mongoose";

const messageModel = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  status: { type: String, enum: ["sent", "seen"], default: "sent" }, 
}, { timestamps: true });

export const Message = mongoose.model("Message", messageModel);