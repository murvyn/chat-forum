export enum Role {
  student = "student",
  lecturer = "lecturer",
  HOD = "HOD",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  indexNumber: string;
  password: string;
  role: Role;
  departmentId?: number;
  department?: Department;
  headOfDepartment?: Department;
  programId?: number;
  program?: Program;
  courses?: CourseEnrollment[];
  teaches?: Course;
  online: boolean;
  lastSeen?: Date;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}

export interface Department {
  id: number;
  name: string;
  headId?: number;
  head?: User;
  programs?: Program[];
  members?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: number;
  name: string;
  departmentId: number;
  department: Department;
  courses?: Course[];
  students?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: number;
  name: string;
  programId: number;
  program: Program;
  lecturerId: number;
  lecturer: User;
  enrolledStudents?: CourseEnrollment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  id: number;
  studentId: number;
  courseId: number;
  student: User;
  course: Course;
  enrolledAt: Date;
}