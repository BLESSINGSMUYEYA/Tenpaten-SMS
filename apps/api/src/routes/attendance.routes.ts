import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireHeadOrDeputy, requireRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { markAttendanceSchema } from '@myklasi/shared';

const router = Router();

router.use(authenticate);

// ---- Fetch Attendance ----
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { date, classId, type, subjectId } = req.query;

    const whereClause: any = {
      schoolId,
      isDeleted: false,
    };

    if (req.user!.role === 'student') {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.user!.userId, isDeleted: false },
      });
      whereClause.studentId = profile?.id ?? 'none';
    } else if (req.user!.role === 'parent') {
      const relations = await prisma.parentStudent.findMany({
        where: { parentUserId: req.user!.userId, isDeleted: false },
      });
      const studentProfiles = await prisma.studentProfile.findMany({
        where: { userId: { in: relations.map(r => r.studentUserId) } },
      });
      whereClause.studentId = {
        in: studentProfiles.map(p => p.id),
      };
    }

    if (date && typeof date === 'string') {
      whereClause.date = new Date(date);
    }
    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }
    if (type && typeof type === 'string') {
      whereClause.type = type;
    }
    if (subjectId && typeof subjectId === 'string') {
      whereClause.subjectId = subjectId;
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            displayName: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        student: {
          admissionNumber: 'asc',
        },
      },
    });

    sendSuccess(res, attendanceRecords, 'Attendance retrieved successfully');
  })
);

// ---- Mark/Update Attendance ----
router.post(
  '/mark',
  requireRoles('head_teacher', 'deputy_head', 'teacher'),
  validateBody(markAttendanceSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const markedBy = req.user!.userId;
    const { classId, termId, date, type, subjectId, periodNumber, records } = req.body;

    const parsedDate = new Date(date);

    // Run sequentially to handle potential duplicate attempts cleanly
    const savedRecords = [];
    for (const rec of records) {
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: rec.studentId,
          date: parsedDate,
          type: type as any,
          periodNumber: periodNumber || null,
          isDeleted: false,
        },
      });

      if (existing) {
        const updated = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: rec.status as any,
            reason: rec.reason || null,
            markedBy,
          },
        });
        savedRecords.push(updated);
      } else {
        const created = await prisma.attendance.create({
          data: {
            schoolId,
            studentId: rec.studentId,
            classId,
            termId,
            date: parsedDate,
            type: type as any,
            periodNumber: periodNumber || null,
            status: rec.status as any,
            reason: rec.reason || null,
            markedBy,
          },
        });
        savedRecords.push(created);
      }
    }

    sendSuccess(res, savedRecords, 'Attendance marked successfully');
  })
);

// ---- Override Attendance ----
router.post(
  '/override',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const { attendanceId, newStatus, reason } = req.body;

    if (!attendanceId || !newStatus || !reason) {
      throw new ValidationError({
        body: ['attendanceId, newStatus, and reason are required in request body'],
      });
    }

    const attendance = await prisma.attendance.findFirst({
      where: { id: attendanceId, schoolId: req.user!.schoolId!, isDeleted: false },
    });

    if (!attendance) {
      throw new NotFoundError('Attendance record');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create audit log for override
      await tx.attendanceOverride.create({
        data: {
          attendanceId,
          overriddenBy: req.user!.userId,
          oldStatus: attendance.status,
          newStatus: newStatus as any,
          reason,
        },
      });

      // Update actual status
      const updated = await tx.attendance.update({
        where: { id: attendanceId },
        data: {
          status: newStatus as any,
        },
      });

      return updated;
    });

    sendSuccess(res, result, 'Attendance overridden successfully');
  })
);

export default router;
