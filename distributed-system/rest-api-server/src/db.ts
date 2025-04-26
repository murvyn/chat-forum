import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  // Load JSON data
  const usersData = JSON.parse(
    fs.readFileSync('../chat-app-data/chat-forum.users2.json', 'utf-8')
  );
  const coursesData = JSON.parse(
    fs.readFileSync('../chat-app-data/chat-forum.courses.json', 'utf-8')
  );
  const departmentsData = JSON.parse(
    fs.readFileSync('../chat-app-data/chat-forum.departments.json', 'utf-8')
  );

  // Add Departments
  const departmentMap = new Map();
  for (const department of departmentsData) {
    const createdDepartment = await prisma.department.upsert({
      where: { name: department.name },
      update: {},
      create: {
        name: department.name,
      },
    });
    departmentMap.set(department._id.$oid, createdDepartment.id);
  }

  // Add Courses
  const courseMap = new Map();
  for (const course of coursesData) {
    const departmentId = departmentMap.get(course.department._id.$oid);
    const createdCourse = await prisma.course.upsert({
      where: { id: course.id }, // Ensure `course.id` is a unique identifier in your data
      update: {},
      create: {
        name: course.name as string,
        program: undefined,
        lecturer: undefined,
      },
    });
    courseMap.set(course._id.$oid, createdCourse.id);
  }

  // Add Users
  for (const user of usersData) {
    // const departmentId = departmentMap.get(user.department._id.$oid);
    // const courseIds = user.courses.map((course: any) =>
    //   courseMap.get(course._id.$oid)
    // );


    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        indexNumber: user.indexNumber,
        password: user.password,
        role: user.role,
        // courses: {
        //   connect: courseIds.map((id: string) => ({ id })),
        // },
        online: user.online,
        photoUrl: user.photoUrl,
      },
    });
  }

  console.log('Data successfully seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });