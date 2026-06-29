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
  createGradingScaleSchema,
  updateTimetableConfigSchema,
  createExamScheduleSchema,
  createRoomSchema,
} from '@myklasi/shared';

const router = Router();

// Apply auth to all routes in this router
router.use(authenticate);

// ---- School Profile / Settings ----
router.get(
  '/my-school',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });
    if (!school) throw new Error('School not found');
    sendSuccess(res, school, 'School profile retrieved successfully');
  })
);

router.put(
  '/my-school',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const {
      name,
      schoolCode,
      type,
      motto,
      address,
      district,
      phone,
      email,
    } = req.body;

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        name,
        schoolCode,
        type,
        motto,
        address,
        district,
        phone,
        email,
        setupComplete: true
      },
    });

    sendSuccess(res, updated, 'Institutional details updated successfully');
  })
);

router.patch(
  '/my-school/timetable-config',
  requireHeadOrDeputy(),
  validateBody(updateTimetableConfigSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { timetableConfig } = req.body;

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: { timetableConfig },
    });

    sendSuccess(res, updated, 'Timetable configuration updated successfully');
  })
);

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

router.patch(
  '/academic-years/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent } = req.body;

    if (isCurrent) {
      // Unset previous current academic year
      await prisma.academicYear.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const updated = await prisma.academicYear.update({
      where: { id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isCurrent,
      },
    });

    sendSuccess(res, updated, 'Academic year updated successfully');
  })
);

router.delete(
  '/academic-years/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.academicYear.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Academic year deleted successfully');
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

router.patch(
  '/terms/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;
    const { academicYearId, name, startDate, endDate, isCurrent } = req.body;

    if (isCurrent) {
      // Unset previous current term
      await prisma.term.updateMany({
        where: { schoolId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const updated = await prisma.term.update({
      where: { id },
      data: {
        academicYearId,
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isCurrent,
      },
    });

    sendSuccess(res, updated, 'Term updated successfully');
  })
);

router.delete(
  '/terms/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.term.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Term deleted successfully');
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
        room: true,
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
    const { name, stream, academicYearId, roomId } = req.body;

    const displayName = stream ? `${name} ${stream}` : name;

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name,
        stream,
        displayName,
        academicYearId,
        roomId: roomId || undefined,
      },
      include: {
        academicYear: true,
        room: true,
      }
    });

    sendSuccess(res, newClass, 'Class created successfully', 201);
  })
);

router.patch(
  '/classes/:id',
  requireHeadOrDeputy(),
  validateBody(createClassSchema.partial()),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;
    const { name, stream, academicYearId, roomId } = req.body;

    const existing = await prisma.class.findFirst({
      where: { id, schoolId, isDeleted: false },
    });
    if (!existing) throw new Error('Class not found');

    const updatedName = name !== undefined ? name.trim() : existing.name;
    const updatedStream = stream !== undefined ? (stream === null || stream.trim() === '' ? null : stream.trim()) : existing.stream;
    const displayName = updatedStream ? `${updatedName} ${updatedStream}` : updatedName;

    const updated = await prisma.class.update({
      where: { id },
      data: {
        name: updatedName,
        stream: updatedStream,
        displayName,
        academicYearId: academicYearId || existing.academicYearId,
        roomId: roomId !== undefined ? roomId : undefined,
      },
      include: {
        academicYear: true,
        room: true,
      }
    });

    sendSuccess(res, updated, 'Class updated successfully');
  })
);

router.delete(
  '/classes/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.class.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Class deleted successfully');
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
    const { name, code, isCore, gradingScaleId, caMax, examMax } = req.body;

    const newSubject = await prisma.subject.create({
      data: {
        schoolId,
        name,
        code,
        isCore,
        gradingScaleId: gradingScaleId || null,
        caMax: caMax !== undefined ? caMax : 30,
        examMax: examMax !== undefined ? examMax : 70,
      },
    });

    sendSuccess(res, newSubject, 'Subject created successfully', 201);
  })
);

router.delete(
  '/subjects/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.subject.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Subject deleted successfully');
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
      subject: { isDeleted: false },
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

router.delete(
  '/class-subjects/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.classSubject.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Class subject assignment deleted successfully');
  })
);

// ---- Update Subject ----
router.patch(
  '/subjects/:id',
  requireHeadOrDeputy(),
  validateBody(createSubjectSchema.partial()),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code, isCore, gradingScaleId, caMax, examMax } = req.body;

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code,
        isCore,
        gradingScaleId,
        caMax,
        examMax,
      },
    });

    sendSuccess(res, updated, 'Subject updated successfully');
  })
);

// ---- Grading Scales ----
router.get(
  '/grading-scales',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const scales = await prisma.gradingScale.findMany({
      where: { schoolId, isDeleted: false },
      include: { rules: { orderBy: { minPercentage: 'desc' } } },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, scales, 'Grading scales retrieved successfully');
  })
);

router.post(
  '/grading-scales',
  requireHeadOrDeputy(),
  validateBody(createGradingScaleSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { name, isDefault, rules } = req.body;

    const scale = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.gradingScale.updateMany({
          where: { schoolId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const newScale = await tx.gradingScale.create({
        data: {
          schoolId,
          name,
          isDefault,
          rules: {
            create: rules.map((r: any) => ({
              gradeSymbol: r.gradeSymbol,
              minPercentage: r.minPercentage,
              maxPercentage: r.maxPercentage,
              classification: r.classification,
            })),
          },
        },
        include: { rules: true },
      });

      return newScale;
    });

    sendSuccess(res, scale, 'Grading scale created successfully', 201);
  })
);

router.delete(
  '/grading-scales/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updated = await prisma.gradingScale.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Grading scale deleted successfully');
  })
);

// ---- Exam Schedules ----
router.get(
  '/exams',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, termId } = req.query;

    const whereClause: any = { schoolId, isDeleted: false };
    if (classId) whereClause.classId = String(classId);
    if (termId) whereClause.termId = String(termId);

    const exams = await prisma.examSchedule.findMany({
      where: whereClause,
      include: {
        term: true,
        class: true,
        subject: true,
      },
      orderBy: { date: 'asc' },
    });

    sendSuccess(res, exams, 'Exam schedules retrieved successfully');
  })
);

router.post(
  '/exams',
  requireHeadOrDeputy(),
  validateBody(createExamScheduleSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { termId, classId, subjectId, date, time, venue, status } = req.body;

    const exam = await prisma.examSchedule.create({
      data: {
        schoolId,
        termId,
        classId,
        subjectId,
        date: new Date(date),
        time,
        venue,
        status: status || 'Upcoming',
      },
      include: {
        term: true,
        class: true,
        subject: true,
      },
    });

    sendSuccess(res, exam, 'Exam scheduled successfully', 201);
  })
);

router.patch(
  '/exams/:id',
  requireHeadOrDeputy(),
  validateBody(createExamScheduleSchema.partial()),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;
    const { termId, classId, subjectId, date, time, venue, status } = req.body;

    const existing = await prisma.examSchedule.findFirst({
      where: { id, schoolId, isDeleted: false },
    });
    if (!existing) throw new Error('Exam schedule not found');

    const updated = await prisma.examSchedule.update({
      where: { id },
      data: {
        termId: termId || undefined,
        classId: classId || undefined,
        subjectId: subjectId || undefined,
        date: date ? new Date(date) : undefined,
        time: time || undefined,
        venue: venue || undefined,
        status: status || undefined,
      },
      include: {
        term: true,
        class: true,
        subject: true,
      },
    });

    sendSuccess(res, updated, 'Exam schedule updated successfully');
  })
);

router.delete(
  '/exams/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;

    const existing = await prisma.examSchedule.findFirst({
      where: { id, schoolId, isDeleted: false },
    });
    if (!existing) throw new Error('Exam schedule not found');

    const updated = await prisma.examSchedule.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Exam schedule deleted successfully');
  })
);

// ---- Rooms ----
router.get(
  '/rooms',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const rooms = await prisma.room.findMany({
      where: { schoolId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, rooms, 'Rooms retrieved successfully');
  })
);

router.post(
  '/rooms',
  requireHeadOrDeputy(),
  validateBody(createRoomSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { name, capacity, type } = req.body;

    const existing = await prisma.room.findFirst({
      where: { schoolId, name, isDeleted: false },
    });
    if (existing) {
      throw new Error(`A room with the name "${name}" already exists.`);
    }

    const room = await prisma.room.create({
      data: {
        schoolId,
        name,
        capacity: capacity ? Number(capacity) : null,
        type,
      },
    });

    sendSuccess(res, room, 'Room created successfully', 201);
  })
);

router.patch(
  '/rooms/:id',
  requireHeadOrDeputy(),
  validateBody(createRoomSchema.partial()),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;
    const { name, capacity, type } = req.body;

    const existing = await prisma.room.findFirst({
      where: { id, schoolId, isDeleted: false },
    });
    if (!existing) throw new Error('Room not found');

    if (name && name !== existing.name) {
      const duplicate = await prisma.room.findFirst({
        where: { schoolId, name, isDeleted: false, NOT: { id } },
      });
      if (duplicate) {
        throw new Error(`A room with the name "${name}" already exists.`);
      }
    }

    const updated = await prisma.room.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        capacity: capacity !== undefined ? (capacity ? Number(capacity) : null) : undefined,
        type: type !== undefined ? type : undefined,
      },
    });

    sendSuccess(res, updated, 'Room updated successfully');
  })
);

router.delete(
  '/rooms/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;

    const existing = await prisma.room.findFirst({
      where: { id, schoolId, isDeleted: false },
    });
    if (!existing) throw new Error('Room not found');

    const updated = await prisma.room.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, updated, 'Room deleted successfully');
  })
);

export default router;
