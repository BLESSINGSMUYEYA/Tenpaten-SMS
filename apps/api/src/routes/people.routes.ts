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

    // Check email uniqueness if email is provided
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, schoolId, isDeleted: false },
      });

      if (existing) {
        throw new ValidationError({ email: ['User with this email already exists in this school'] });
      }
    }

    // Auto-generate unique username for staff (e.g. name.surname, name.surname2, etc.)
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const baseUsername = `${cleanFirst}.${cleanLast}`;
    let username = baseUsername;
    let counter = 1;

    while (true) {
      const existingUser = await prisma.user.findFirst({
        where: { username, schoolId, isDeleted: false },
      });
      if (!existingUser) break;
      counter++;
      username = `${baseUsername}${counter}`;
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
        email: email || null,
        username,
        phone,
        passwordHash,
        role: role as UserRole,
        isActive: true,
        mustChangePassword: true,
        photoUrl,
      },
    });

    // Send welcome email asynchronously if email is provided
    if (email) {
      emailService.sendWelcomeEmail({
        email,
        firstName,
        schoolName: school.name,
        schoolCode: school.schoolCode,
        tempPassword,
      }).catch(err => {
        console.error('Failed to send staff welcome email:', err);
      });
    }

    sendSuccess(res, {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      tempPassword,
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
            username: true,
            tempPassword: true,
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
                    username: true,
                    tempPassword: true,
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

    // Count students to generate sequence admission number
    const studentCount = await prisma.studentProfile.count({
      where: { schoolId },
    });
    const admissionNumber = generateAdmissionNumber(school.schoolCode, new Date().getFullYear(), studentCount + 1);

    const tempPassword = generateTempPassword();
    const studentPasswordHash = await bcrypt.hash(tempPassword, commonSalt);

    let parentTempPassword: string | null = null;
    const cleanParentUsername = `parent.${admissionNumber.replace(/\//g, '.')}`;

    const result = await prisma.$transaction(async (tx) => {
      // Create guardian user if not exists
      if (!parentUser) {
        const guardianNames = guardian.fullName.trim().split(/\s+/);
        const parentFirstName = guardianNames[0] || 'Parent';
        const parentLastName = guardianNames.slice(1).join(' ') || 'Guardian';
        const parentTempPass = generateTempPassword();
        parentTempPassword = parentTempPass;
        const parentHash = await bcrypt.hash(parentTempPass, commonSalt);
        const parentEmail = guardian.email || null;
        const parentUsername = parentEmail ? null : cleanParentUsername;

        parentUser = await tx.user.create({
          data: {
            schoolId,
            firstName: parentFirstName,
            lastName: parentLastName,
            email: parentEmail,
            username: parentUsername,
            phone: guardian.phone,
            passwordHash: parentHash,
            role: UserRole.parent,
            isActive: true,
            mustChangePassword: true,
            tempPassword: parentTempPass,
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

      // Create student user (no fake email, login username is their admissionNumber)
      const stdUser = await tx.user.create({
        data: {
          schoolId,
          firstName,
          lastName,
          email: null,
          username: admissionNumber,
          passwordHash: studentPasswordHash,
          role: UserRole.student,
          isActive: true,
          mustChangePassword: true,
          tempPassword,
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

    sendSuccess(res, {
      student: result.student,
      user: result.user,
      tempPassword,
      parentUsername: guardian.email ? null : cleanParentUsername,
      parentTempPassword,
    }, 'Student enrolled successfully', 201);
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

// ---- Delete Student ----
router.delete(
  '/students/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params; // StudentProfile ID

    const studentProfile = await prisma.studentProfile.findFirst({
      where: { id, schoolId, isDeleted: false },
      include: { user: true },
    });

    if (!studentProfile) {
      throw new NotFoundError('Student');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Soft delete StudentProfile
      await tx.studentProfile.update({
        where: { id: studentProfile.id },
        data: { isDeleted: true },
      });

      // 2. Soft delete student User record & deactivate
      await tx.user.update({
        where: { id: studentProfile.userId },
        data: { isDeleted: true, isActive: false },
      });

      // 3. Soft delete ParentStudent relationships
      await tx.parentStudent.updateMany({
        where: { studentUserId: studentProfile.userId, isDeleted: false },
        data: { isDeleted: true },
      });
    });

    sendSuccess(res, null, 'Student deleted successfully');
  })
);

export default router;
