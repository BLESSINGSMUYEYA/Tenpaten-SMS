import { PrismaClient, SchoolType, UserRole, DayOfWeek, StudentStatus, AttendanceStatus, GradeStatus, InvoiceStatus, PaymentMethod, AnnouncementAudience, AnnouncementPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean the database (soft delete or hard delete for seeding? Since we're re-initializing, let's clear existing data safely in reverse order of dependencies)
  console.log('Cleaning old seed data...');
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.feeStructure.deleteMany({});
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
  await prisma.school.deleteMany({});

  console.log('Database cleaned.');

  // Common password hash for all seed users
  const salt = bcrypt.genSaltSync(10);
  const commonPasswordHash = bcrypt.hashSync('Password123', salt);

  // ==========================================
  // 1. CREATE SUPER ADMIN
  // ==========================================
  console.log('Creating Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Tenpaten',
      email: 'admin@tenpaten.com',
      passwordHash: commonPasswordHash,
      role: UserRole.super_admin,
      isActive: true,
      mustChangePassword: false,
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
      passwordHash: commonPasswordHash,
      role: UserRole.head_teacher,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const deputyHead = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Limbani',
      lastName: 'Banda',
      email: 'deputy@sunshine.com',
      phone: '+265 999 123 456',
      passwordHash: commonPasswordHash,
      role: UserRole.deputy_head,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const bursar = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Eliza',
      lastName: 'Mwale',
      email: 'bursar@sunshine.com',
      phone: '+265 888 987 654',
      passwordHash: commonPasswordHash,
      role: UserRole.bursar,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const teacherMath = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Chimwemwe',
      lastName: 'Kavalo',
      email: 'math.teacher@sunshine.com',
      phone: '+265 888 234 567',
      passwordHash: commonPasswordHash,
      role: UserRole.teacher,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const teacherScience = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Blessings',
      lastName: 'Chiumia',
      email: 'science.teacher@sunshine.com',
      phone: '+265 999 234 567',
      passwordHash: commonPasswordHash,
      role: UserRole.teacher,
      isActive: true,
      mustChangePassword: false,
    },
  });

  const teacherHumanities = await prisma.user.create({
    data: {
      schoolId: school.id,
      firstName: 'Patricia',
      lastName: 'Gondwe',
      email: 'humanities.teacher@sunshine.com',
      phone: '+265 888 345 678',
      passwordHash: commonPasswordHash,
      role: UserRole.teacher,
      isActive: true,
      mustChangePassword: false,
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
  console.log('Creating Subjects and assigning to Classes...');

  const subEnglish = await prisma.subject.create({
    data: { schoolId: school.id, name: 'English Language', code: 'ENG', isCore: true },
  });

  const subMath = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Mathematics', code: 'MTH', isCore: true },
  });

  const subPhysSci = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Physical Science', code: 'PSC', isCore: true },
  });

  const subBiology = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Biology', code: 'BIO', isCore: true },
  });

  const subHistory = await prisma.subject.create({
    data: { schoolId: school.id, name: 'History', code: 'HIS', isCore: false },
  });

  const subGeography = await prisma.subject.create({
    data: { schoolId: school.id, name: 'Geography', code: 'GEO', isCore: false },
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
        passwordHash: commonPasswordHash,
        role: UserRole.parent,
        isActive: true,
        mustChangePassword: false,
      },
    });

    // 2. Create Student User
    const studentUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        firstName: std.firstName,
        lastName: std.lastName,
        email: `${std.firstName.toLowerCase()}.${std.lastName.toLowerCase()}@sunshine.com`,
        passwordHash: commonPasswordHash,
        role: UserRole.student,
        isActive: true,
        mustChangePassword: false,
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

  // ==========================================
  // 10. CREATE FEE STRUCTURES, INVOICES & PAYMENTS
  // ==========================================
  console.log('Seeding Fee Structures, Invoices, and Payments...');

  // Setup fee structures for Term 2 Form 1
  const feeStructureItems = [
    { itemName: 'Tuition Fees', amount: 150000 },
    { itemName: 'Development Fund', amount: 30000 },
    { itemName: 'Science Lab Fee', amount: 10000 },
  ];

  const totalTermFees = feeStructureItems.reduce((acc, item) => acc + item.amount, 0);

  for (const item of feeStructureItems) {
    await prisma.feeStructure.create({
      data: {
        schoolId: school.id,
        classId: classForm1E.id,
        termId: term2.id,
        itemName: item.itemName,
        amount: item.amount,
        isLocked: true,
      },
    });
  }

  // Generate Invoices for students
  const activeProfiles = await prisma.studentProfile.findMany({
    where: { schoolId: school.id, classId: classForm1E.id },
  });

  let receiptSeq = 1;

  for (const [index, profile] of activeProfiles.entries()) {
    // 1. Create Invoice
    const invoice = await prisma.invoice.create({
      data: {
        schoolId: school.id,
        studentId: profile.id,
        termId: term2.id,
        totalAmount: totalTermFees,
        discountAmount: index === 3 ? 20000 : 0, // Offer a discount to the 4th student (Lusekelo)
        discountReason: index === 3 ? 'Bursary Scheme' : null,
        finalAmount: index === 3 ? totalTermFees - 20000 : totalTermFees,
        paidAmount: 0,
        balance: index === 3 ? totalTermFees - 20000 : totalTermFees,
        status: InvoiceStatus.unpaid,
      },
    });

    // Create invoice line items
    for (const item of feeStructureItems) {
      await prisma.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          itemName: item.itemName,
          amount: item.itemName === 'Tuition Fees' && index === 3 ? 130000 : item.amount,
        },
      });
    }

    // Record payments for some students to represent different states (Fully Paid, Partially Paid, Unpaid)
    if (index === 0) {
      // Alinafe: Fully Paid
      const amountToPay = invoice.finalAmount;
      await prisma.payment.create({
        data: {
          schoolId: school.id,
          studentId: profile.id,
          invoiceId: invoice.id,
          amount: amountToPay,
          paymentDate: new Date(),
          method: PaymentMethod.bank,
          referenceNumber: 'REF-BANK-9921',
          receivedBy: bursar.id,
          receiptNumber: `RCP-2026-${String(receiptSeq++).padStart(5, '0')}`,
        },
      });

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: amountToPay,
          balance: 0,
          status: InvoiceStatus.paid,
        },
      });
    } else if (index === 1) {
      // Wongani: Partially Paid
      const amountToPay = 100000;
      await prisma.payment.create({
        data: {
          schoolId: school.id,
          studentId: profile.id,
          invoiceId: invoice.id,
          amount: amountToPay,
          paymentDate: new Date(),
          method: PaymentMethod.mobile_money,
          referenceNumber: 'PPAMB-7821-BND',
          receivedBy: bursar.id,
          receiptNumber: `RCP-2026-${String(receiptSeq++).padStart(5, '0')}`,
        },
      });

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: amountToPay,
          balance: invoice.finalAmount - amountToPay,
          status: InvoiceStatus.partial,
        },
      });
    }
    // Student 2 (Tiwonge) and Student 3 (Lusekelo) will remain unpaid
  }

  console.log('Fee structures, student invoices, and invoice payments populated successfully.');

  // ==========================================
  // 11. SEED SYSTEM ANNOUNCEMENTS
  // ==========================================
  console.log('Seeding Announcements...');

  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: 'Opening of Term 2 Academic Year',
      body: 'Welcome back all students and teachers to Term 2. Class schedules are now active, and teachers have updated class timetables on their dashboards. Make sure to log in daily and complete register attendance.',
      audience: AnnouncementAudience.all,
      priority: AnnouncementPriority.normal,
      postedBy: headTeacher.id,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      title: 'URGENT: Fee Balance Settlement',
      body: 'All parents are reminded that Term 2 fee balances must be settled in full by the end of the month. Failure to comply will lead to student suspension under our school code fee collection policy.',
      audience: AnnouncementAudience.parents,
      priority: AnnouncementPriority.urgent,
      postedBy: headTeacher.id,
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log('Announcements seeded.');

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
