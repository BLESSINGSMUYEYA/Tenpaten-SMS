import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireHeadOrDeputy } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError } from '../utils/errors';
import { createTimetableSlotSchema } from '@myklasi/shared';
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

    // If requester is a teacher, auto-scope to their own schedule
    if (req.user!.role === 'teacher') {
      whereClause.teacherId = req.user!.userId;
    } else if (teacherId && typeof teacherId === 'string') {
      whereClause.teacherId = teacherId;
    }

    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }
    if (termId && typeof termId === 'string') {
      whereClause.termId = termId;
    }

    const slots = await prisma.timetableSlot.findMany({
      where: whereClause,
      include: {
        class: { select: { id: true, displayName: true } },
        subject: { select: { id: true, name: true, code: true, isCore: true } },
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
    const { classId, subjectId, teacherId, day, periodNumber, room, roomId, termId } = req.body;

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

    // Resolve room name and validate room availability to prevent double-booking
    let resolvedRoomName = room;
    if (roomId) {
      const dbRoom = await prisma.room.findFirst({
        where: { id: roomId, schoolId, isDeleted: false },
      });
      if (dbRoom) {
        resolvedRoomName = dbRoom.name;
      }
    }

    if (roomId || resolvedRoomName) {
      const roomConflict = await prisma.timetableSlot.findFirst({
        where: {
          day: day as DayOfWeek,
          periodNumber,
          termId,
          isDeleted: false,
          OR: [
            roomId ? { roomId } : null,
            resolvedRoomName ? { room: resolvedRoomName } : null,
          ].filter(Boolean) as any,
        },
        include: { class: true },
      });

      if (roomConflict) {
        throw new ValidationError({
          room: [`Room "${resolvedRoomName || room}" is already booked by ${roomConflict.class.displayName} on ${day} Period ${periodNumber}`],
        });
      }
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        schoolId,
        classId,
        subjectId,
        teacherId,
        day: day as DayOfWeek,
        periodNumber,
        room: resolvedRoomName,
        roomId: roomId || undefined,
        termId,
      },
    });

    sendSuccess(res, slot, 'Timetable slot created successfully', 201);
  })
);

/**
 * @route   PATCH /api/timetable/slots/:id/move
 * @desc    Move a timetable slot to a new day/period (or swap with occupant)
 * @access  Head Teacher / Deputy Head
 */
router.patch(
  '/slots/:id/move',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { id } = req.params;
    const { day, periodNumber } = req.body;

    if (!day || periodNumber == null) {
      throw new ValidationError({ body: ['day and periodNumber are required'] });
    }

    // 1. Find the slot being dragged
    const slot = await prisma.timetableSlot.findFirst({
      where: { id, schoolId, isDeleted: false },
    });

    if (!slot) {
      const { NotFoundError } = require('../utils/errors');
      throw new NotFoundError('Timetable slot');
    }

    // No-op if dropped onto the same cell
    if (slot.day === day && slot.periodNumber === periodNumber) {
      return sendSuccess(res, slot, 'Slot unchanged (same position)');
    }

    // 2. Check if the target cell already has a slot for the SAME class
    const occupant = await prisma.timetableSlot.findFirst({
      where: {
        classId: slot.classId,
        day: day as DayOfWeek,
        periodNumber,
        termId: slot.termId,
        isDeleted: false,
      },
    });

    // 3. Teacher conflict check — is this teacher already busy at the TARGET cell?
    //    Exclude the occupant (it will be swapped away) and the slot itself.
    const teacherConflict = await prisma.timetableSlot.findFirst({
      where: {
        teacherId: slot.teacherId,
        day: day as DayOfWeek,
        periodNumber,
        termId: slot.termId,
        isDeleted: false,
        id: { notIn: [id, ...(occupant ? [occupant.id] : [])] },
      },
    });

    if (teacherConflict) {
      throw new ValidationError({
        teacherId: [`Teacher is already scheduled in another class on ${day} Period ${periodNumber}`],
      });
    }

    // 3.5 Room conflict check — is this room already busy at the TARGET cell?
    //     Exclude the occupant (it will be swapped away) and the slot itself.
    if (slot.roomId || slot.room) {
      const roomConflict = await prisma.timetableSlot.findFirst({
        where: {
          day: day as DayOfWeek,
          periodNumber,
          termId: slot.termId,
          isDeleted: false,
          id: { notIn: [id, ...(occupant ? [occupant.id] : [])] },
          OR: [
            slot.roomId ? { roomId: slot.roomId } : null,
            slot.room ? { room: slot.room } : null,
          ].filter(Boolean) as any,
        },
        include: { class: true }
      });

      if (roomConflict) {
        throw new ValidationError({
          room: [`Room is already booked by ${roomConflict.class.displayName} on ${day} Period ${periodNumber}`],
        });
      }
    }

    // 4. If swapping, also check the occupant's teacher isn't conflicted at the SOURCE cell
    if (occupant && occupant.teacherId !== slot.teacherId) {
      const reverseConflict = await prisma.timetableSlot.findFirst({
        where: {
          teacherId: occupant.teacherId,
          day: slot.day,
          periodNumber: slot.periodNumber,
          termId: slot.termId,
          isDeleted: false,
          id: { notIn: [occupant.id, id] },
        },
      });

      if (reverseConflict) {
        throw new ValidationError({
          teacherId: [`Cannot swap — the other teacher is already scheduled on ${slot.day} Period ${slot.periodNumber}`],
        });
      }
    }

    // 4.5 If swapping, also check the occupant's room isn't conflicted at the SOURCE cell
    if (occupant && (occupant.roomId || occupant.room) && (occupant.roomId !== slot.roomId || occupant.room !== slot.room)) {
      const reverseRoomConflict = await prisma.timetableSlot.findFirst({
        where: {
          day: slot.day,
          periodNumber: slot.periodNumber,
          termId: slot.termId,
          isDeleted: false,
          id: { notIn: [occupant.id, id] },
          OR: [
            occupant.roomId ? { roomId: occupant.roomId } : null,
            occupant.room ? { room: occupant.room } : null,
          ].filter(Boolean) as any,
        },
        include: { class: true }
      });

      if (reverseRoomConflict) {
        throw new ValidationError({
          room: [`Cannot swap — the room of the swapped class is already booked at the source position by ${reverseRoomConflict.class.displayName}`],
        });
      }
    }

    // 5. Execute move or swap inside a transaction
    if (occupant) {
      // Swap: occupant takes the dragged slot's old position
      const [updated, swapped] = await prisma.$transaction([
        prisma.timetableSlot.update({
          where: { id },
          data: { day: day as DayOfWeek, periodNumber },
        }),
        prisma.timetableSlot.update({
          where: { id: occupant.id },
          data: { day: slot.day, periodNumber: slot.periodNumber },
        }),
      ]);
      sendSuccess(res, { moved: updated, swapped }, 'Slots swapped successfully');
    } else {
      // Simple move
      const updated = await prisma.timetableSlot.update({
        where: { id },
        data: { day: day as DayOfWeek, periodNumber },
      });
      sendSuccess(res, updated, 'Slot moved successfully');
    }
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
