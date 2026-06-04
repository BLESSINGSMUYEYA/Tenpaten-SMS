import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireHeadOrDeputy } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError } from '../utils/errors';
import { createTimetableSlotSchema } from '@tenpaten/shared';
import { DayOfWeek } from '@prisma/client';

const router = Router();
router.use(authenticate);

// ---- GET Timetable Slots ----
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, teacherId, termId } = req.query;

    const whereClause: any = {
      schoolId,
      isDeleted: false,
    };

    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }
    if (teacherId && typeof teacherId === 'string') {
      whereClause.teacherId = teacherId;
    }
    if (termId && typeof termId === 'string') {
      whereClause.termId = termId;
    }

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause,
      include: {
        class: { select: { id: true, displayName: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        term: { select: { id: true, name: true } },
      },
      orderBy: [
        { day: 'asc' },
        { periodNumber: 'asc' },
      ],
    });

    sendSuccess(res, slots, 'Timetable slots retrieved successfully');
  })
);

// ---- POST Add Timetable Slot ----
router.post(
  '/slots',
  requireHeadOrDeputy(),
  validateBody(createTimetableSlotSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, subjectId, teacherId, day, periodNumber, room, termId } = req.body;

    // Check if class already has a scheduled slot at this period
    const classConflict = await prisma.timetableSlot.findFirst({
      where: {
        classId,
        day: day as DayOfWeek,
        periodNumber,
        termId,
        isDeleted: false,
      },
    });

    if (classConflict) {
      throw new ValidationError({
        periodNumber: [`This class already has a subject scheduled for ${day} Period ${periodNumber}`],
      });
    }

    // Check if teacher is teaching another class at this period
    const teacherConflict = await prisma.timetableSlot.findFirst({
      where: {
        teacherId,
        day: day as DayOfWeek,
        periodNumber,
        termId,
        isDeleted: false,
      },
    });

    if (teacherConflict) {
      throw new ValidationError({
        teacherId: [`This teacher is already scheduled to teach another class on ${day} Period ${periodNumber}`],
      });
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        schoolId,
        classId,
        subjectId,
        teacherId,
        day: day as DayOfWeek,
        periodNumber,
        room,
        termId,
      },
    });

    sendSuccess(res, slot, 'Timetable slot created successfully', 201);
  })
);

/**
 * @route   DELETE /api/timetable/slots/:id
 * @desc    Delete a timetable slot
 * @access  Head Teacher / Deputy Head
 */
router.delete(
  '/slots/:id',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;

    // We look up by id, schoolId, isDeleted: false.
    // If not found, throw NotFoundError (we import it from '../utils/errors')
    const slot = await prisma.timetableSlot.findFirst({
      where: { id, schoolId, isDeleted: false },
    });

    if (!slot) {
      const { NotFoundError } = require('../utils/errors');
      throw new NotFoundError('Timetable slot');
    }

    await prisma.timetableSlot.update({
      where: { id },
      data: { isDeleted: true },
    });

    sendSuccess(res, null, 'Timetable slot deleted successfully');
  })
);

export default router;
