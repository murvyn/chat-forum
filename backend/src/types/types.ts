import { JwtPayload } from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

export enum UserRole {
  STUDENT = "student",
  LECTURER = "lecturer",
  HOD = "HOD",
}

export interface ValidateUserProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole; // Changed to single type
  departmentId: string;
}

export interface ValidatePasswordProps {
  password: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole; // Using enum
  indexNumber: string;
  department: { _id: Schema.Types.ObjectId; name: string };
  courses: { _id: Schema.Types.ObjectId; name: string }[];
  generateAuthToken: () => string;
  online: boolean;
  lastSeen: Date;
  photoUrl: string;
}

export interface TokenPayload extends JwtPayload {
  email: string;
  id: string;
}

export interface IFeed extends Document {
  author: mongoose.Schema.Types.ObjectId;
  text?: string; // Optional
  images?: string[]; // Optional
  audio?: string; // Optional
  video?: string; // Optional
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  sender: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  type: string;
}

export enum ChatType {
  COURSE = "course",
  GROUP = "group",
  DEPARTMENT = "department",
  DIRECT = "direct",
}

export interface IChat extends Document {
  members: Schema.Types.ObjectId[];
  owner?: Schema.Types.ObjectId; // Optional
  type: ChatType; // Using enum
  courses?: Schema.Types.ObjectId[]; // Optional
  program?: Schema.Types.ObjectId; // Optional
  department?: Schema.Types.ObjectId; // Optional
  name?: string; // Optional
  _id: Schema.Types.ObjectId;
}

export interface IDepartment extends Document {
  name: string;
  head: Schema.Types.ObjectId;
  lecturers: Schema.Types.ObjectId[];
}

export interface IProgram extends Document {
  name: string;
  department: Schema.Types.ObjectId;
  courses: Schema.Types.ObjectId[];
}

export interface ICourse extends Document {
  name: string;
  code: string;
  department: { _id: Schema.Types.ObjectId; name: string };
  lecturers: Schema.Types.ObjectId[];
  students: Schema.Types.ObjectId[];
}
