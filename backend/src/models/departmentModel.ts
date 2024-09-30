import mongoose, { Schema } from "mongoose";
import { IDepartment } from "../types/types";

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
    },
    head: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    lecturers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
    ],
  },
  { timestamps: true }
);

departmentSchema.index({ lecturers: 1 }, { unique: true });

departmentSchema.index({ name: 1 });

const Department = mongoose.model<IDepartment>("Department", departmentSchema);

export default Department;
