import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Joi from "joi";
import type { IUser, ValidateUserProps } from "../types/types";
import _ from "lodash";

export const departmentSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

// Define a sub-schema for courses
const courseSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  indexNumber: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
    // match: /^\d{10}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "lecturer", "HOD"],
  },
  department: {
    type: departmentSchema,
    required: true,
  },
  courses: {
    type: [courseSchema],
    required: true,
  },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date },
  photoUrl: String,
});

const jwtPrivateKey = process.env.JWTPrivateKey;

if (!jwtPrivateKey) {
  throw new Error("JWTPrivateKey environment variable not set");
}

userSchema.methods.generateAuthToken = function () {
  const payload = _.pick(this.toObject(), [
    "_id",
    "role",
    "firstName",
    "lastName",
    "email",
    "indexNumber",
    "department",
    "courses",
    "photoUrl",
  ]);
  return jwt.sign(payload, jwtPrivateKey);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;

export const validateUser = (user: ValidateUserProps) => {
  const schema = Joi.object({
    password: Joi.string().min(8).required(),
    indexNumber: Joi.string().required().length(10),
  });
  return schema.validate(user);
};
