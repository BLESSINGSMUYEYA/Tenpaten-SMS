import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireHeadOrDeputy } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess } from '../utils/errors';
import {
  createAcademicYearSchema,
  createTermSchema,
  createClassSchema,
  createSubjectSchema,
  assignSubjectSchema,
} from '@tenpaten/shared';

const router = Router();

// Apply auth to all routes in this router
router.use(authenticate);

// ---- Academic Years ----
router.get(
  '/academic-years',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const years = await prisma.academicYear.findMany({
      where: { schoolId, isDeleted: false },
      orderBy: { startDate: 'desc' },
    });
    sendSuccess(res, years, 'Academic years retrieved successfully');
  })
);

router.post(
  '/academic-years',
  requireHeadOrDeputy(),
  validateBody(createAcademicYearSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { name, startDate, endDate, isCurrent } = req.body;

    if (isCurrent) {
      // Unset previous current academic year
      await prisma.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const academicYear = await prisma.academicYear.create({
      data: {
        schoolId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent,
      },
    });

    sendSuccess(res, academicYear, 'Academic year created successfully', 201);
  })
);

// ---- Terms ----
router.get(
  '/terms',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const terms = await prisma.term.findMany({
      where: { schoolId, isDeleted: false },
      include: { academicYear: true },
      orderBy: { startDate: 'desc' },
    });
    sendSuccess(res, terms, 'Terms retrieved successfully');
  })
);

router.post(
  '/terms',
  requireHeadOrDeputy(),
  validateBody(createTermSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { academicYearId, name, startDate, endDate, isCurrent } = req.body;

    if (isCurrent) {
      // Unset previous current term
      await prisma.term.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const term = await prisma.term.create({
      data: {
        schoolId,
        academicYearId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isCurrent,
      },
    });

    sendSuccess(res, term, 'Term created successfully', 201);
  })
);

// ---- Classes ----
router.get(
  '/classes',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const classes = await prisma.class.findMany({
      where: { schoolId, isDeleted: false },
      include: {
        academicYear: true,
        _count: {
          select: { studentProfiles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, classes, 'Classes retrieved successfully');
  })
);

router.post(
  '/classes',
  requireHeadOrDeputy(),
  validateBody(createClassSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { name, stream, academicYearId } = req.body;

    const displayName = stream ? `${name} ${stream}` : name;

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name,
        stream,
        displayName,
        academicYearId,
      },
    });

    sendSuccess(res, newClass, 'Class created successfully', 201);
  })
);

// ---- Subjects ----
router.get(
  '/subjects',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const subjects = await prisma.subject.findMany({
      where: { schoolId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, subjects, 'Subjects retrieved successfully');
  })
);

router.post(
  '/subjects',
  requireHeadOrDeputy(),
  validateBody(createSubjectSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { name, code, isCore } = req.body;

    const newSubject = await prisma.subject.create({
      data: {
        schoolId,
        name,
        code,
        isCore,
      },
    });

    sendSuccess(res, newSubject, 'Subject created successfully', 201);
  })
);

// ---- Class Subjects (Assignments) ----
router.get(
  '/class-subjects',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { teacherId, classId } = req.query;

    const whereClause: any = {
      class: { schoolId, isDeleted: false },
      isDeleted: false,
    };

    // If requester is a teacher, auto-scope to their own assignments
    if (req.user!.role === 'teacher') {
      whereClause.teacherId = req.user!.userId;
    } else if (teacherId && typeof teacherId === 'string') {
      // Admin/head teacher can filter by specific teacher
      whereClause.teacherId = teacherId;
    }

    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            _count: {
              select: { studentProfiles: { where: { isDeleted: false } } },
            },
          },
        },
        subject: true,
        teacher: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { class: { name: 'asc' } },
    });
    sendSuccess(res, classSubjects, 'Class subject assignments retrieved successfully');
  })
);

router.post(
  '/class-subjects',
  requireHeadOrDeputy(),
  validateBody(assignSubjectSchema),
  asyncHandler(async (req, res) => {
    const { classId, subjectId, teacherId } = req.body;

    const assignment = await prisma.classSubject.upsert({
      where: {
        classId_subjectId: { classId, subjectId },
      },
      create: {
        classId,
        subjectId,
        teacherId,
      },
      update: {
        teacherId,
        isDeleted: false,
      },
    });

    sendSuccess(res, assignment, 'Subject assigned to class successfully', 201);
  })
);

export default router;
