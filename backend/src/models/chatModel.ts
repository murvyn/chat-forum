import mongoose, { Schema } from "mongoose";
import type { IChat } from "../types/types";

const chatSchema = new Schema<IChat>(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, unique: true },
    type: {
      type: String,
      enum: ["course", "group", "department", "direct"],
      required: true,
    },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    program: { type: Schema.Types.ObjectId, ref: "Program" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

chatSchema.index({ name: 1, type: 1 });

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;
