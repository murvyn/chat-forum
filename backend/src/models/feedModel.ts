import mongoose, { Schema } from "mongoose";
import type { IFeed } from "../types/types";

const feedSchema = new Schema<IFeed>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
    },
    audio: {
      type: String,
    },
    video: {
      type: String,
    },
  },
  { timestamps: true }
);

const Feed = mongoose.model<IFeed>("Feed", feedSchema);

export default Feed;
