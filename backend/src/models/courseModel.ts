import mongoose, { Schema } from "mongoose";
import { ICourse } from "../types/types";
import { departmentSchema } from "./userModel";

export const lecturerSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

// Define a sub-schema for student
export const studentSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});

const courseSchema = new Schema<ICourse>({
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: {
    type: departmentSchema,
    required: true,
  },
  lecturers: [{ type: lecturerSchema, required: true }],
  students: [{ type: studentSchema }],
});

courseSchema.index({ name: 1, code: 1 });

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;
