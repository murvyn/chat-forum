import mongoose, { Schema } from "mongoose";
import { IProgram } from "../types/types";

const programSchema = new Schema<IProgram>({
  name: { type: String, required: true, unique: true },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
});

const Program = mongoose.model<IProgram>("Program", programSchema);

export default Program;
