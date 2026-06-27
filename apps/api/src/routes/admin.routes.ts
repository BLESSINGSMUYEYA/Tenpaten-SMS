import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { createSchoolCode, createUniqueSchoolCode, generateTempPassword } from '../utils/helpers';

import { emailService } from '../services/email.service';
import { createSchoolSchema, updateSchoolProfileSchema } from '@myklasi/shared';
import { UserRole, Prisma } from '@prisma/client';

const router = Router();

// Apply auth and super admin guards to all routes in this router
router.use(authenticate);
router.use(requireSuperAdmin());

/**
 * @route   GET /api/admin/schools/check-code
 * @desc    Check if a school code is already taken (for real-time uniqueness check)
 * @access  Super Admin
 */
router.get(
  '/schools/check-code',
  asyncHandler(async (req, res) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new ValidationError({ code: ['School code is required'] });
    }

    const existing = await prisma.school.findUnique({
      where: { schoolCode: code.trim().toUpperCase() },
    });

    sendSuccess(res, { available: !existing }, existing ? 'School code is already in use' : 'School code is available');
  })
);

/**
 * @route   GET /api/admin/schools
 * @desc    Get all schools (with optional filters)
 * @access  Super Admin
 */
router.get(
  '/schools',
  asyncHandler(async (req, res) => {
    const schools = await prisma.school.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        schoolCode: true,
        subscriptionPlan: true,
        type: true,
        district: true,
        country: true,
        isActive: true,
        setupComplete: true,
        createdAt: true,
        featuresAttendance: true,
        featuresGrades: true,
        featuresFees: true,
        featuresCommunication: true,
        _count: {
          select: {
            users: {
              where: { isDeleted: false },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, schools, 'Schools retrieved successfully');
  })
);

/**
 * @route   GET /api/admin/schools/:id
 * @desc    Get a school's details
 * @access  Super Admin
 */
router.get(
  '/schools/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const school = await prisma.school.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        schoolCode: true,
        subscriptionPlan: true,
        type: true,
        district: true,
        country: true,
        isActive: true,
        setupComplete: true,
        createdAt: true,
        email: true,
        phone: true,
        address: true,
        motto: true,
        featuresAttendance: true,
        featuresGrades: true,
        featuresFees: true,
        featuresCommunication: true,
        _count: {
          select: {
            users: { where: { isDeleted: false } },
            studentProfiles: { where: { isDeleted: false } },
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundError('School');
    }

    // Map studentProfiles count to students for frontend compatibility
    const mappedSchool = {
      ...school,
      _count: {
        users: school._count.users,
        students: school._count.studentProfiles,
      },
    };

    sendSuccess(res, mappedSchool, 'School details retrieved successfully');
  })
);

/**
 * @route   POST /api/admin/schools
 * @desc    Create a new school and its first Head Teacher user
 * @access  Super Admin
 */
router.post(
  '/schools',
  validateBody(createSchoolSchema),
  asyncHandler(async (req, res) => {
    const {
      name, type, district, country,
      subscriptionPlan, email: schoolEmail, phone: schoolPhone, address: schoolAddress,
      schoolDirector, headTeacher,
      customInitials,
      featuresAttendance,
      featuresGrades,
      featuresFees,
      featuresCommunication,
    } = req.body;

    // ── Uniqueness checks ──────────────────────────────────────────────────
    const emailsToCheck = [schoolDirector.email, headTeacher?.email].filter(Boolean) as string[];
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: emailsToCheck }, isDeleted: false },
      select: { email: true },
    });

    if (existingUsers.length > 0) {
      const taken = existingUsers.map((u: { email: string | null }) => u.email);
      const errors: Record<string, string[]> = {};
      if (taken.includes(schoolDirector.email)) {
        errors['schoolDirector.email'] = ['This email is already registered in the system'];
      }
      if (headTeacher && taken.includes(headTeacher.email)) {
        errors['headTeacher.email'] = ['This email is already registered in the system'];
      }
      throw new ValidationError(errors);
    }

    // ── School code generation ─────────────────────────────────────────────
    const normalizedInitials = customInitials
      ? String(customInitials).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
      : undefined;
    const schoolCode = await createUniqueSchoolCode(name, normalizedInitials || undefined);

    // ── Temp passwords ─────────────────────────────────────────────────────
    const directorTempPassword = generateTempPassword();
    const directorHash = await bcrypt.hash(directorTempPassword, await bcrypt.genSalt(10));

    let htTempPassword: string | null = null;
    let htHash: string | null = null;
    if (headTeacher) {
      htTempPassword = generateTempPassword();
      htHash = await bcrypt.hash(htTempPassword, await bcrypt.genSalt(10));
    }

    // ── Transactional creation ─────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newSchool = await tx.school.create({
        data: {
          name,
          type,
          district,
          country: country || 'Malawi',
          schoolCode,
          subscriptionPlan: subscriptionPlan || 'basic',
          email: schoolEmail,
          phone: schoolPhone,
          address: schoolAddress,
          isActive: true,
          setupComplete: false,
          featuresAttendance: featuresAttendance !== undefined ? featuresAttendance : true,
          featuresGrades: featuresGrades !== undefined ? featuresGrades : true,
          featuresFees: featuresFees !== undefined ? featuresFees : true,
          featuresCommunication: featuresCommunication !== undefined ? featuresCommunication : true,
        },
      });

      // Always create the School Director
      const newDirector = await tx.user.create({
        data: {
          schoolId: newSchool.id,
          firstName: schoolDirector.firstName,
          lastName: schoolDirector.lastName,
          email: schoolDirector.email,
          phone: schoolDirector.phone,
          passwordHash: directorHash,
          role: UserRole.school_director,
          isActive: true,
          mustChangePassword: true,
        },
      });

      // Optionally create the Head Teacher
      let newHeadTeacher = null;
      if (headTeacher && htHash) {
        newHeadTeacher = await tx.user.create({
          data: {
            schoolId: newSchool.id,
            firstName: headTeacher.firstName,
            lastName: headTeacher.lastName,
            email: headTeacher.email,
            phone: headTeacher.phone,
            passwordHash: htHash,
            role: UserRole.head_teacher,
            isActive: true,
            mustChangePassword: true,
          },
        });
      }

      return { school: newSchool, schoolDirector: newDirector, headTeacher: newHeadTeacher };
    });

    // ── Welcome emails (async, non-blocking) ──────────────────────────────
    emailService.sendWelcomeEmail({
      email: schoolDirector.email,
      firstName: schoolDirector.firstName,
      schoolName: name,
      schoolCode,
      tempPassword: directorTempPassword,
    }).catch((err: unknown) => console.error('Director welcome email failed:', err));

    if (headTeacher && htTempPassword) {
      emailService.sendWelcomeEmail({
        email: headTeacher.email,
        firstName: headTeacher.firstName,
        schoolName: name,
        schoolCode,
        tempPassword: htTempPassword,
      }).catch((err: unknown) => console.error('Head Teacher welcome email failed:', err));
    }

    sendSuccess(
      res,
      result,
      `School onboarded successfully. ${headTeacher ? '2 accounts' : '1 account'} created.`,
      201
    );
  })
);

/**
 * @route   PUT /api/admin/schools/:id
 * @desc    Update school profile / info
 * @access  Super Admin
 */
router.put(
  '/schools/:id',
  validateBody(updateSchoolProfileSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const school = await prisma.school.findFirst({
      where: { id, isDeleted: false },
    });

    if (!school) {
      throw new NotFoundError('School');
    }

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: req.body,
    });

    sendSuccess(res, updatedSchool, 'School updated successfully');
  })
);

/**
 * @route   PATCH /api/admin/schools/:id/status
 * @desc    Activate or deactivate a school's access
 * @access  Super Admin
 */
router.patch(
  '/schools/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new ValidationError({ isActive: ['isActive status must be a boolean value'] });
    }

    const school = await prisma.school.findFirst({
      where: { id, isDeleted: false },
    });

    if (!school) {
      throw new NotFoundError('School');
    }

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: { isActive },
    });

    sendSuccess(res, updatedSchool, `School ${isActive ? 'activated' : 'deactivated'} successfully`);
  })
);

/**
 * @route   GET /api/admin/stats
 * @desc    Get platform-wide counts and stats
 * @access  Super Admin
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const totalSchools = await prisma.school.count({ where: { isDeleted: false } });
    const activeSchools = await prisma.school.count({ where: { isDeleted: false, isActive: true } });

    // Count users by role
    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      where: { isDeleted: false },
      _count: { id: true },
    });

    const counts: Record<string, number> = {
      super_admin: 0,
      head_teacher: 0,
      deputy_head: 0,
      teacher: 0,
      bursar: 0,
      student: 0,
      parent: 0,
    };

    userCounts.forEach((group) => {
      if (group.role in counts) {
        counts[group.role] = group._count.id;
      }
    });

    const totalStaff = counts.head_teacher + counts.deputy_head + counts.teacher + counts.bursar;
    const totalStudents = counts.student;
    const totalParents = counts.parent;
    const totalUsers = await prisma.user.count({ where: { isDeleted: false } });

    sendSuccess(res, {
      totalSchools,
      activeSchools,
      totalStudents,
      totalStaff,
      totalParents,
      totalUsers,
    }, 'Stats retrieved successfully');
  })
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all platform users
 * @access  Super Admin
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { role, search, limit: limitParam } = req.query;
    const limit = Math.min(parseInt(limitParam as string) || 200, 500);

    const whereClause: any = {
      isDeleted: false,
      // Super admin only manages admin-level staff — not student/parent accounts
      role: { notIn: ['student', 'parent'] as any },
    };

    // Optional role filter
    if (role && typeof role === 'string') {
      whereClause.role = role;
    }

    // Optional name/email search (pushed to DB instead of in-memory)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      whereClause.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        mustChangePassword: true,
        school: {
          select: {
            id: true,
            name: true,
            schoolCode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    sendSuccess(res, users, 'Users retrieved successfully');
  })
);

/**
 * @route   POST /api/admin/users
 * @desc    Create a new user account assigned to a school
 * @access  Super Admin
 */
router.post(
  '/users',
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, role, schoolId } = req.body;

    if (!firstName || !lastName || !email || !role || !schoolId) {
      throw new ValidationError({ message: ['Required fields missing: firstName, lastName, email, role, schoolId'] });
    }

    // Check if school exists
    const school = await prisma.school.findFirst({
      where: { id: schoolId, isDeleted: false },
    });
    if (!school) {
      throw new ValidationError({ schoolId: ['Assigned school does not exist'] });
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
    if (existingUser) {
      throw new ValidationError({ email: ['User with this email already exists in the system'] });
    }

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const newUser = await prisma.user.create({
      data: {
        schoolId,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role,
        isActive: true,
        mustChangePassword: true,
      },
      include: {
        school: {
          select: {
            name: true,
          },
        },
      },
    });

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail({
      email,
      firstName,
      schoolName: school.name,
      schoolCode: school.schoolCode,
      tempPassword,
    }).catch((err) => {
      console.error('Welcome email failed to send:', err);
    });

    sendSuccess(res, newUser, 'User account created successfully', 201);
  })
);

/**
 * @route   DELETE /api/admin/schools/:id
 * @desc    Delete a school and all associated data
 * @access  Super Admin
 */
router.delete(
  '/schools/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const school = await prisma.school.findFirst({
      where: { id },
    });

    if (!school) {
      throw new NotFoundError('School');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete AttendanceOverride where attendance.schoolId = id
      await tx.attendanceOverride.deleteMany({
        where: {
          attendance: {
            schoolId: id,
          },
        },
      });

      // 2. Delete Attendance where schoolId = id
      await tx.attendance.deleteMany({
        where: { schoolId: id },
      });

      // 3. Delete Grade where schoolId = id
      await tx.grade.deleteMany({
        where: { schoolId: id },
      });

      // 4. Delete FeePayment where schoolId = id
      await tx.feePayment.deleteMany({
        where: { schoolId: id },
      });

      // 5. Delete Invoice where schoolId = id
      await tx.invoice.deleteMany({
        where: { schoolId: id },
      });

      // 6. Delete FeeStructure where schoolId = id
      await tx.feeStructure.deleteMany({
        where: { schoolId: id },
      });

      // 7. Delete TimetableSlot where schoolId = id
      await tx.timetableSlot.deleteMany({
        where: { schoolId: id },
      });

      // 8. Delete ClassSubject where class.schoolId = id
      await tx.classSubject.deleteMany({
        where: {
          class: {
            schoolId: id,
          },
        },
      });

      // 9. Delete StudentProfile where schoolId = id
      await tx.studentProfile.deleteMany({
        where: { schoolId: id },
      });

      // 10. Delete ParentStudent where parent or student belongs to this school
      await tx.parentStudent.deleteMany({
        where: {
          OR: [
            { parent: { schoolId: id } },
            { student: { schoolId: id } },
          ],
        },
      });

      // 11. Delete PasswordResetToken where user.schoolId = id
      await tx.passwordResetToken.deleteMany({
        where: {
          user: {
            schoolId: id,
          },
        },
      });

      // 12. Delete User where schoolId = id
      await tx.user.deleteMany({
        where: { schoolId: id },
      });

      // 13. Delete Class where schoolId = id
      await tx.class.deleteMany({
        where: { schoolId: id },
      });

      // 14. Delete Term where schoolId = id
      await tx.term.deleteMany({
        where: { schoolId: id },
      });

      // 15. Delete Subject where schoolId = id
      await tx.subject.deleteMany({
        where: { schoolId: id },
      });

      // 16. Delete GradingRule where scale.schoolId = id
      await tx.gradingRule.deleteMany({
        where: {
          scale: {
            schoolId: id,
          },
        },
      });

      // 17. Delete GradingScale where schoolId = id
      await tx.gradingScale.deleteMany({
        where: { schoolId: id },
      });

      // 18. Delete AcademicYear where schoolId = id
      await tx.academicYear.deleteMany({
        where: { schoolId: id },
      });

      // 19. Delete School where id = id
      await tx.school.delete({
        where: { id },
      });
    });

    sendSuccess(res, null, 'School and all its associated data deleted successfully');
  })
);

export default router;
