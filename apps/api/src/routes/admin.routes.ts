import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { createSchoolCode, generateTempPassword } from '../utils/helpers';
import { emailService } from '../services/email.service';
import { createSchoolSchema, updateSchoolProfileSchema } from '@tenpaten/shared';
import { UserRole, Prisma } from '@prisma/client';

const router = Router();

// Apply auth and super admin guards to all routes in this router
router.use(authenticate);
router.use(requireSuperAdmin);

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
      include: {
        _count: {
          select: {
            users: true,
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
 * @route   POST /api/admin/schools
 * @desc    Create a new school and its first Head Teacher user
 * @access  Super Admin
 */
router.post(
  '/schools',
  validateBody(createSchoolSchema),
  asyncHandler(async (req, res) => {
    const { name, type, district, country, headTeacher } = req.body;

    // Check if head teacher email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: headTeacher.email,
        isDeleted: false,
      },
    });

    if (existingUser) {
      throw new ValidationError({ 'headTeacher.email': ['A user with this email address already exists in the system'] });
    }

    // Generate unique school code
    const schoolCode = createSchoolCode(name);

    // Generate temporary password for the Head Teacher
    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    // Transactional creation of School and Head Teacher User
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newSchool = await tx.school.create({
        data: {
          name,
          type,
          district,
          country: country || 'Malawi',
          schoolCode,
          isActive: true,
          setupComplete: false,
        },
      });

      const newHeadTeacher = await tx.user.create({
        data: {
          schoolId: newSchool.id,
          firstName: headTeacher.firstName,
          lastName: headTeacher.lastName,
          email: headTeacher.email,
          phone: headTeacher.phone,
          passwordHash,
          role: UserRole.head_teacher,
          isActive: true,
          mustChangePassword: true, // Force change on first login
        },
      });

      return { school: newSchool, headTeacher: newHeadTeacher };
    });

    // Send Welcome Email asynchronously
    emailService.sendWelcomeEmail({
      email: headTeacher.email,
      firstName: headTeacher.firstName,
      schoolName: name,
      schoolCode,
      tempPassword,
    }).catch((err) => {
      console.error('Welcome email failed to send:', err);
    });

    sendSuccess(res, result, 'School and Head Teacher created successfully', 201);
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
 * @route   GET /api/admin/users
 * @desc    Get all platform users
 * @access  Super Admin
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        school: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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

export default router;
