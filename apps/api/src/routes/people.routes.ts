import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireHeadOrDeputy } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { generateTempPassword, generateAdmissionNumber } from '../utils/helpers';
import { emailService } from '../services/email.service';
import { createUserSchema, createStudentSchema } from '@myklasi/shared';
import { UserRole, Prisma, StudentStatus, User } from '@prisma/client';

const router = Router();

router.use(authenticate);

// ---- List Staff ----
router.get(
  '/staff',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const staff = await prisma.user.findMany({
      where: {
        schoolId,
        isDeleted: false,
        role: {
          in: [UserRole.head_teacher, UserRole.deputy_head, UserRole.teacher],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        photoUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, staff, 'Staff list retrieved successfully');
  })
);

// ---- Onboard Staff ----
router.post(
  '/staff',
  requireHeadOrDeputy(),
  validateBody(createUserSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { firstName, lastName, email, phone, role, photoUrl } = req.body;

    // Check email uniqueness
    const existing = await prisma.user.findFirst({
      where: { email, schoolId, isDeleted: false },
    });

    if (existing) {
      throw new ValidationError({ email: ['User with this email already exists in this school'] });
    }

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const school = await prisma.school.findFirst({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundError('School');
    }

    const newUser = await prisma.user.create({
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role: role as UserRole,
        isActive: true,
        mustChangePassword: true,
        photoUrl,
      },
    });

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail({
      email,
      firstName,
      schoolName: school.name,
      schoolCode: school.schoolCode,
      tempPassword,
    }).catch(err => {
      console.error('Failed to send staff welcome email:', err);
    });

    sendSuccess(res, {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    }, 'Staff onboarded successfully', 201);
  })
);

// ---- List Students ----
router.get(
  '/students',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId } = req.query;

    const whereClause: Prisma.StudentProfileWhereInput = {
      schoolId,
      isDeleted: false,
    };

    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photoUrl: true,
            studentRelations: {
              where: { isDeleted: false },
              include: {
                parent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        class: true,
      },
      orderBy: { admissionNumber: 'asc' },
    });

    const mappedStudents = students.map(s => {
      const { studentRelations, ...userWithoutRelations } = s.user;
      return {
        ...s,
        user: userWithoutRelations,
        parentRelations: studentRelations,
      };
    });

    sendSuccess(res, mappedStudents, 'Students list retrieved successfully');
  })
);

// ---- Onboard Student ----
router.post(
  '/students',
  requireHeadOrDeputy(),
  validateBody(createStudentSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      photoUrl,
      classId,
      boardingStatus,
      enrollmentDate,
      guardian,
    } = req.body;

    const school = await prisma.school.findFirst({
      where: { id: schoolId },
    });

    if (!school) {
      throw new NotFoundError('School');
    }

    // Check if class exists and belongs to school
    const classRecord = await prisma.class.findFirst({
      where: { id: classId, schoolId, isDeleted: false },
    });

    if (!classRecord) {
      throw new NotFoundError('Class');
    }

    // Check/Create Guardian/Parent User
    let parentUser: User | null = null;
    if (guardian.email) {
      parentUser = await prisma.user.findFirst({
        where: { email: guardian.email, schoolId, isDeleted: false },
      });
    }

    const commonSalt = await bcrypt.genSalt(10);

    // Generate unique student email/credentials
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const studentEmail = `${cleanFirstName}.${cleanLastName}@${school.schoolCode.toLowerCase()}.edu`;

    const existingStudentUser = await prisma.user.findFirst({
      where: { email: studentEmail, schoolId, isDeleted: false },
    });

    if (existingStudentUser) {
      throw new ValidationError({ email: ['Student with generated email address already exists. Please adjust names.'] });
    }

    // Count students to generate sequence admission number
    const studentCount = await prisma.studentProfile.count({
      where: { schoolId },
    });
    const admissionNumber = generateAdmissionNumber(school.schoolCode, new Date().getFullYear(), studentCount + 1);

    const tempPassword = generateTempPassword();
    const studentPasswordHash = await bcrypt.hash(tempPassword, commonSalt);

    const result = await prisma.$transaction(async (tx) => {
      // Create guardian user if not exists
      if (!parentUser) {
        const guardianNames = guardian.fullName.trim().split(/\s+/);
        const parentFirstName = guardianNames[0] || 'Parent';
        const parentLastName = guardianNames.slice(1).join(' ') || 'Guardian';
        const parentTempPass = generateTempPassword();
        const parentHash = await bcrypt.hash(parentTempPass, commonSalt);
        const parentEmail = guardian.email || `guardian.${cleanFirstName}.${cleanLastName}@${school.schoolCode.toLowerCase()}.edu`;

        parentUser = await tx.user.create({
          data: {
            schoolId,
            firstName: parentFirstName,
            lastName: parentLastName,
            email: parentEmail,
            phone: guardian.phone,
            passwordHash: parentHash,
            role: UserRole.parent,
            isActive: true,
            mustChangePassword: true,
          },
        });

        // Async notify parent (can be logged)
        if (guardian.email) {
          emailService.sendWelcomeEmail({
            email: guardian.email,
            firstName: parentFirstName,
            schoolName: school.name,
            schoolCode: school.schoolCode,
            tempPassword: parentTempPass,
          }).catch(console.error);
        }
      }

      // Create student user
      const stdUser = await tx.user.create({
        data: {
          schoolId,
          firstName,
          lastName,
          email: studentEmail,
          passwordHash: studentPasswordHash,
          role: UserRole.student,
          isActive: true,
          mustChangePassword: true,
          photoUrl,
        },
      });

      // Create student profile
      const stdProfile = await tx.studentProfile.create({
        data: {
          userId: stdUser.id,
          schoolId,
          admissionNumber,
          classId,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender,
          boardingStatus,
          enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
          status: StudentStatus.active,
        },
      });

      // Map relation parent-student
      await tx.parentStudent.create({
        data: {
          parentUserId: parentUser.id,
          studentUserId: stdUser.id,
          relationship: guardian.relationship,
        },
      });

      return { student: stdProfile, user: stdUser };
    });

    sendSuccess(res, result, 'Student enrolled successfully', 201);
  })
);

// ---- List Parents ----
router.get(
  '/parents',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const parents = await prisma.user.findMany({
      where: {
        schoolId,
        isDeleted: false,
        role: UserRole.parent,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, parents, 'Parents list retrieved successfully');
  })
);

export default router;
