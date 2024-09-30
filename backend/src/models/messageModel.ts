import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    type: String,
    chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    course: { type: Schema.Types.ObjectId, ref: "Course" },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
