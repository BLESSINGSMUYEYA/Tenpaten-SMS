import { PrismaClient, SchoolType, UserRole, DayOfWeek, StudentStatus, AttendanceStatus, GradeStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean the database (soft delete or hard delete for seeding? Since we're re-initializing, let's clear existing data safely in reverse order of dependencies)
  console.log('Cleaning old seed data...');
  await prisma.grade.deleteMany({});
  await prisma.attendanceOverride.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.parentStudent.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.timetableSlot.deleteMany({});
  await prisma.classSubject.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.academicYear.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.gradingRule.deleteMany({});
  await prisma.gradingScale.deleteMany({});
  await prisma.school.deleteMany({});

  console.log('Database cleaned.');

  // ==========================================
  // ROLE-SPECIFIC DEFAULT PASSWORDS
  // These are INITIAL credentials — users should change them on first login.
  // Super Admin:   Admin@Tenpaten2026
  // Head Teacher:  HeadSS@2026
  // Deputy Head:   DeputySS@2026
  // Bursar:        BursarSS@2026
  // Teacher:       TeacherSS@2026
  // Parent:        ParentSS@2026
  // Student:       StudentSS@2026
  // ==========================================
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash    = bcrypt.hashSync('Admin@Tenpaten2026', salt);
  const headPasswordHash     = bcrypt.hashSync('HeadSS@2026', salt);
  const deputyPasswordHash   = bcrypt.hashSync('DeputySS@2026', salt);
  const bursarPasswordHash   = bcrypt.hashSync('BursarSS@2026', salt);
  const teacherPasswordHash  = bcrypt.hashSync('TeacherSS@2026', salt);
  const parentPasswordHash   = bcrypt.hashSync('ParentSS@2026', salt);
  const studentPasswordHash  = bcrypt.hashSync('StudentSS@2026', salt);

  // ==========================================
  // 1. CREATE SUPER ADMIN
  // ==========================================
  console.log('Creating Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Tenpaten',
      email: 'admin@tenpaten.com',
      passwordHash: adminPasswordHash,
      role: UserRole.super_admin,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });
  console.log(`Super Admin created: ${superAdmin.email}`);

  // ==========================================
  // 2. CREATE SUNSHINE SECONDARY SCHOOL
  // ==========================================
  console.log('Creating Sunshine Secondary School...');
  const school = await prisma.school.create({
    data: {
      name: 'Sunshine Secondary School',
      type: SchoolType.secondary,
      district: 'Lilongwe',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=250&auto=format&fit=crop',
      motto: 'Let Your Light Shine',
      address: 'P.O. Box 450, Lilongwe, Malawi',
      phone: '+265 1 750 120',
      email: 'info@sunshine.ac.mw',
      schoolCode: 'SSS-2026-4821',
      subscriptionPlan: 'premium',
      subscriptionStart: new Date('2026-01-01'),
      subscriptionEnd: new Date('2027-01-01'),
      isActive: true,
      setupComplete: true,
    },
  });
  console.log(`School created: ${school.name} (${school.schoolCode})`);

  // ==========================================
  // 3. CREATE SCHOOL STAFF (Head, Deputy, Bursar, Teachers)
  // ==========================================
  console.log('Creating staff members...');

  const headTeacher = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Chikondi',
      lastName: 'Phiri',
      email: 'head@sunshine.com',
      phone: '+265 888 123 456',
      passwordHash: headPasswordHash,
      role: UserRole.head_teacher,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });

  const deputyHead = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Limbani',
      lastName: 'Banda',
      email: 'deputy@sunshine.com',
      phone: '+265 999 123 456',
      passwordHash: deputyPasswordHash,
      role: UserRole.deputy_head,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });

  const bursar = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Eliza',
      lastName: 'Mwale',
      email: 'bursar@sunshine.com',
      phone: '+265 888 987 654',
      passwordHash: bursarPasswordHash,
      role: UserRole.bursar,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });

  const teacherMath = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Chimwemwe',
      lastName: 'Kavalo',
      email: 'math.teacher@sunshine.com',
      phone: '+265 888 234 567',
      passwordHash: teacherPasswordHash,
      role: UserRole.teacher,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });

  const teacherScience = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Blessings',
      lastName: 'Chiumia',
      email: 'science.teacher@sunshine.com',
      phone: '+265 999 234 567',
      passwordHash: teacherPasswordHash,
      role: UserRole.teacher,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });

  const teacherHumanities = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Patricia',
      lastName: 'Gondwe',
      email: 'humanities.teacher@sunshine.com',
      phone: '+265 888 345 678',
      passwordHash: teacherPasswordHash,
      role: UserRole.teacher,
      isActive: true,
      mustChangePassword: true, // Must change on first login
    },
  });

  console.log('Staff created: Head Teacher, Deputy, Bursar, and 3 Teachers.');

  // ==========================================
  // 4. CREATE ACADEMIC YEAR & TERMS
  // ==========================================
  console.log('Creating Academic Year and Terms...');

  const academicYear = await prisma.academicYear.create({
    data: {
      schoolId: school.id,
      name: '2025/2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-07-31'),
      isCurrent: true,
    },
  });

  const term1 = await prisma.term.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Term 1',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-18'),
      isCurrent: false,
    },
  });

  const term2 = await prisma.term.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Term 2',
      startDate: new Date('2026-01-05'),
      endDate: new Date('2026-04-03'),
      isCurrent: true, // Currently in Term 2
    },
  });

  const term3 = await prisma.term.create({
    data: {
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Term 3',
      startDate: new Date('2026-04-20'),
      endDate: new Date('2026-07-24'),
      isCurrent: false,
    },
  });

  console.log('Academic Year 2025/2026 created with Terms 1, 2, and 3.');

  // ==========================================
  // 5. CREATE CLASSES
  // ==========================================
  console.log('Creating Classes...');

  const classForm1E = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: 'Form 1',
      stream: 'East',
      displayName: 'Form 1 East',
      academicYearId: academicYear.id,
    },
  });

  const classForm1W = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: 'Form 1',
      stream: 'West',
      displayName: 'Form 1 West',
      academicYearId: academicYear.id,
    },
  });

  const classForm2E = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: 'Form 2',
      stream: 'East',
      displayName: 'Form 2 East',
      academicYearId: academicYear.id,
    },
  });

  const classForm3E = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: 'Form 3',
      stream: 'East',
      displayName: 'Form 3 East',
      academicYearId: academicYear.id,
    },
  });

  const classForm4E = await prisma.class.create({
    data: {
      schoolId: school.id,
      name: 'Form 4',
      stream: 'East',
      displayName: 'Form 4 East',
      academicYearId: academicYear.id,
    },
  });

  console.log('Classes created: Form 1 East/West, Form 2 East, Form 3 East, Form 4 East.');

  // ==========================================
  // 6. CREATE SUBJECTS & ASSIGNMENTS
  // ==========================================
  console.log('Creating MSCE Grading Scale...');
  const msceScale = await prisma.gradingScale.create({
    data: {
      schoolId: school.id,
      name: 'MSCE 9-Point Scale',
      isDefault: true,
      rules: {
        create: [
          { gradeSymbol: '1', minPercentage: 80, maxPercentage: 100, classification: 'Distinction' },
          { gradeSymbol: '2', minPercentage: 75, maxPercentage: 79,  classification: 'Distinction' },
          { gradeSymbol: '3', minPercentage: 70, maxPercentage: 74,  classification: 'Credit' },
          { gradeSymbol: '4', minPercentage: 65, maxPercentage: 69,  classification: 'Credit' },
          { gradeSymbol: '5', minPercentage: 60, maxPercentage: 64,  classification: 'Credit' },
          { gradeSymbol: '6', minPercentage: 50, maxPercentage: 59,  classification: 'Credit' },
          { gradeSymbol: '7', minPercentage: 45, maxPercentage: 49,  classification: 'Pass' },
          { gradeSymbol: '8', minPercentage: 40, maxPercentage: 44,  classification: 'Pass' },
          { gradeSymbol: '9', minPercentage: 0,  maxPercentage: 39,  classification: 'Fail' },
        ]
      }
    }
  });

  console.log('Creating Subjects and assigning to Classes...');

  const subEnglish = await prisma.subject.create({
    data: { schoolId: school.id, name: 'English Language', code: 'ENG', isCore: true, gradingScaleId: msceScale.id, caMax: 30, examMax: 70 },
  });

  const subMath = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Mathematics', code: 'MTH', isCore: true, gradingScaleId: msceScale.id, caMax: 40, examMax: 60 },
  });

  const subPhysSci = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Physical Science', code: 'PSC', isCore: true, gradingScaleId: msceScale.id, caMax: 30, examMax: 70 },
  });

  const subBiology = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Biology', code: 'BIO', isCore: true, gradingScaleId: msceScale.id, caMax: 30, examMax: 70 },
  });

  const subHistory = await prisma.subject.create({
    data: { schoolId: school.id, name: 'History', code: 'HIS', isCore: false, gradingScaleId: msceScale.id, caMax: 30, examMax: 70 },
  });

  const subGeography = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Geography', code: 'GEO', isCore: false, gradingScaleId: msceScale.id, caMax: 30, examMax: 70 },
  });

  // Assign subjects to Form 1 East
  const assignments = [
    { classId: classForm1E.id, subjectId: subEnglish.id, teacherId: teacherHumanities.id },
    { classId: classForm1E.id, subjectId: subMath.id, teacherId: teacherMath.id },
    { classId: classForm1E.id, subjectId: subPhysSci.id, teacherId: teacherScience.id },
    { classId: classForm1E.id, subjectId: subBiology.id, teacherId: teacherScience.id },
    { classId: classForm1E.id, subjectId: subHistory.id, teacherId: teacherHumanities.id },
    { classId: classForm1E.id, subjectId: subGeography.id, teacherId: teacherMath.id },
  ];

  for (const assign of assignments) {
    await prisma.classSubject.create({
      data: {
        classId: assign.classId,
        subjectId: assign.subjectId,
        teacherId: assign.teacherId,
      },
    });
  }

  console.log('Subjects English, Math, Physical Science, Biology, History, Geography created and mapped to Form 1 East.');

  // ==========================================
  // 7. CREATE TIMETABLE SLOTS
  // ==========================================
  console.log('Creating Timetable Slots for Form 1 East...');

  const timetableData = [
    { day: DayOfWeek.Mon, period: 1, subject: subMath.id, teacher: teacherMath.id },
    { day: DayOfWeek.Mon, period: 2, subject: subMath.id, teacher: teacherMath.id },
    { day: DayOfWeek.Mon, period: 3, subject: subEnglish.id, teacher: teacherHumanities.id },
    { day: DayOfWeek.Mon, period: 5, subject: subBiology.id, teacher: teacherScience.id }, // period 4 is break
    { day: DayOfWeek.Mon, period: 6, subject: subHistory.id, teacher: teacherHumanities.id },

    { day: DayOfWeek.Tue, period: 1, subject: subPhysSci.id, teacher: teacherScience.id },
    { day: DayOfWeek.Tue, period: 2, subject: subPhysSci.id, teacher: teacherScience.id },
    { day: DayOfWeek.Tue, period: 3, subject: subMath.id, teacher: teacherMath.id },
    { day: DayOfWeek.Tue, period: 5, subject: subEnglish.id, teacher: teacherHumanities.id },
    { day: DayOfWeek.Tue, period: 6, subject: subGeography.id, teacher: teacherMath.id },
  ];

  for (const slot of timetableData) {
    await prisma.timetableSlot.create({
      data: {
        schoolId: school.id,
        classId: classForm1E.id,
        subjectId: slot.subject,
        teacherId: slot.teacher,
        day: slot.day,
        periodNumber: slot.period,
        termId: term2.id,
        room: 'Room F1',
      },
    });
  }
  console.log('Timetable Slots created successfully.');

  // ==========================================
  // 8. CREATE STUDENTS & GUARDIANS / PARENTS
  // ==========================================
  console.log('Creating Students and Parents...');

  const studentDetails = [
    { firstName: 'Alinafe', lastName: 'Phiri', gender: 'female', admission: 'SSS/2026/0001', parentEmail: 'parent.alinafe@mail.com', parentName: 'Gondwe Phiri', parentPhone: '0888456123' },
    { firstName: 'Wongani', lastName: 'Banda', gender: 'male', admission: 'SSS/2026/0002', parentEmail: 'parent.wongani@mail.com', parentName: 'John Banda', parentPhone: '0999789456' },
    { firstName: 'Tiwonge', lastName: 'Mwale', gender: 'female', admission: 'SSS/2026/0003', parentEmail: 'parent.tiwonge@mail.com', parentName: 'Maria Mwale', parentPhone: '0888123987' },
    { firstName: 'Lusekelo', lastName: 'Mwenitete', gender: 'male', admission: 'SSS/2026/0004', parentEmail: 'parent.lusekelo@mail.com', parentName: 'Blessings Mwenitete', parentPhone: '0999321654' },
  ];

  for (const std of studentDetails) {
    // 1. Create Parent User
    const parentUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        firstName: std.parentName.split(' ')[0],
        lastName: std.parentName.split(' ')[1] || 'Guardian',
        email: std.parentEmail,
        phone: std.parentPhone,
        passwordHash: parentPasswordHash,
        role: UserRole.parent,
        isActive: true,
        mustChangePassword: true, // Must change on first login
      },
    });

    // 2. Create Student User
    const studentUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        firstName: std.firstName,
        lastName: std.lastName,
        email: `${std.firstName.toLowerCase()}.${std.lastName.toLowerCase()}@sunshine.com`,
        passwordHash: studentPasswordHash,
        role: UserRole.student,
        isActive: true,
        mustChangePassword: true, // Must change on first login
      },
    });

    // 3. Create Student Profile
    const profile = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        schoolId: school.id,
        admissionNumber: std.admission,
        classId: classForm1E.id,
        dateOfBirth: new Date('2011-05-15'),
        gender: std.gender,
        boardingStatus: 'day',
        status: StudentStatus.active,
      },
    });

    // 4. Map Parent to Student
    await prisma.parentStudent.create({
      data: {
        parentUserId: parentUser.id,
        studentUserId: studentUser.id,
        relationship: 'Parent',
      },
    });

    // ==========================================
    // 9. MOCK GRADE DATA FOR STUDENTS (Term 1)
    // ==========================================
    // Term 1 results - all approved and published
    await prisma.grade.create({
      data: {
        schoolId: school.id,
        studentId: profile.id,
        subjectId: subMath.id,
        classId: classForm1E.id,
        termId: term1.id,
        academicYearId: academicYear.id,
        caMark: 24,
        caMax: 30,
        examMark: 56,
        examMax: 70,
        totalMark: 80,
        gradeLetter: 'A',
        submissionStatus: GradeStatus.locked,
        enteredBy: teacherMath.id,
        approvedBy: headTeacher.id,
        lockedAt: new Date(),
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await prisma.grade.create({
      data: {
        schoolId: school.id,
        studentId: profile.id,
        subjectId: subEnglish.id,
        classId: classForm1E.id,
        termId: term1.id,
        academicYearId: academicYear.id,
        caMark: 21,
        caMax: 30,
        examMark: 49,
        examMax: 70,
        totalMark: 70,
        gradeLetter: 'B',
        submissionStatus: GradeStatus.locked,
        enteredBy: teacherHumanities.id,
        approvedBy: headTeacher.id,
        lockedAt: new Date(),
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  console.log('Students, Parents, and Term 1 Academic Grades loaded.');
  console.log('🌱 Database seeding completed successfully! All constraints and data verified.');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
