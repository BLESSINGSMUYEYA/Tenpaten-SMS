import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireHeadOrDeputy, requireRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { markAttendanceSchema } from '@myklasi/shared';

const router = Router();

router.use(authenticate);

// ---- Attendance Stats ----
router.get(
  '/stats',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { date } = req.query;

    const dateStr = date && typeof date === 'string'
      ? date.substring(0, 10)
      : new Date().toISOString().substring(0, 10);
    const selectedDate = new Date(dateStr);

    // 1. Fetch overall stats for this date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        schoolId,
        date: selectedDate,
        isDeleted: false,
        type: 'morning',
      },
    });

    const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;

    const overallRate = attendanceRecords.length > 0
      ? parseFloat((((presentCount + lateCount) / attendanceRecords.length) * 100).toFixed(1))
      : 0;

    // 2. Fetch class list and calculate class-level stats
    const classes = await prisma.class.findMany({
      where: { schoolId, isDeleted: false },
      include: {
        studentProfiles: {
          where: { isDeleted: false, status: 'active' },
          select: { id: true },
        },
        classSubjects: {
          where: { isDeleted: false },
          include: {
            teacher: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const classesBreakdown = [];
    let classesBelow85 = 0;

    for (const cls of classes) {
      const clsRecords = attendanceRecords.filter(r => r.classId === cls.id);

      const clsPresent = clsRecords.filter(r => r.status === 'present').length;
      const clsLate = clsRecords.filter(r => r.status === 'late').length;
      const clsAbsent = clsRecords.filter(r => r.status === 'absent').length;

      const rate = clsRecords.length > 0
        ? parseFloat((((clsPresent + clsLate) / clsRecords.length) * 100).toFixed(1))
        : 100; // default to 100% if not marked yet

      if (clsRecords.length > 0 && rate < 85) {
        classesBelow85++;
      }

      // Teachers
      const teachers = cls.classSubjects
        .map(cs => cs.teacher ? `${cs.teacher.firstName} ${cs.teacher.lastName}` : null)
        .filter(Boolean);
      const teacherName = teachers.length > 0 ? Array.from(new Set(teachers))[0] : 'No teacher';

      classesBreakdown.push({
        id: cls.id,
        name: cls.displayName,
        teacher: teacherName,
        total: cls.studentProfiles.length,
        present: clsPresent + clsLate,
        absent: clsAbsent,
        late: clsLate,
        rate,
      });
    }

    // 3. Weekly trend chart (past 5 weekdays including the selected date)
    const getMonday = (d: Date) => {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const monday = getMonday(new Date(selectedDate));
    monday.setUTCHours(0, 0, 0, 0);

    const weekTrend = [];
    const trendLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      const dayRecords = await prisma.attendance.findMany({
        where: {
          schoolId,
          date: currentDate,
          isDeleted: false,
          type: 'morning',
        },
        select: { status: true },
      });

      const dayPresent = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const dayRate = dayRecords.length > 0
        ? parseFloat(((dayPresent / dayRecords.length) * 100).toFixed(1))
        : 100.0; // Default to 100.0

      weekTrend.push(dayRate);
    }

    sendSuccess(res, {
      selectedDate: dateStr,
      overallRate: `${overallRate}%`,
      presentToday: String(presentCount + lateCount),
      absentToday: String(absentCount),
      classesBelow85: String(classesBelow85),
      weekTrend,
      trendLabels,
      classes: classesBreakdown,
    }, 'Attendance stats retrieved successfully');
  })
);

// ---- Attendance Detail Panel for a Class ----
router.get(
  '/stats/class-detail',
  requireHeadOrDeputy(),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, date } = req.query;

    if (!classId || typeof classId !== 'string') {
      return res.status(400).json({ status: 'error', message: 'classId is required' });
    }

    const dateStr = date && typeof date === 'string'
      ? date.substring(0, 10)
      : new Date().toISOString().substring(0, 10);
    const selectedDate = new Date(dateStr);

    const students = await prisma.studentProfile.findMany({
      where: { classId, schoolId, isDeleted: false, status: 'active' },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { user: { lastName: 'asc' } },
    });

    const studentIds = students.map(s => s.id);
    const records = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: selectedDate,
        isDeleted: false,
        type: 'morning',
      }
    });

    const studentRecords = students.map((student, index) => {
      const record = records.find(r => r.studentId === student.id);
      return {
        id: index + 1,
        name: `${student.user.firstName} ${student.user.lastName}`,
        admissionNo: student.admissionNumber,
        status: record ? record.status : 'present',
        timeIn: record && record.status !== 'absent' ? (record.status === 'late' ? '07:45' : '07:15') : null,
        reason: record ? record.reason : null,
      };
    });

    sendSuccess(res, studentRecords, 'Class attendance details retrieved successfully');
  })
);

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
