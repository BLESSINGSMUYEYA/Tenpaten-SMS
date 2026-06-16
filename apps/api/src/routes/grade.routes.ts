import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { calculateGrade, calculatePositions } from '../utils/helpers';
import { saveGradesSchema } from '@tenpaten/shared';
import { GradeStatus } from '@prisma/client';

const router = Router();
router.use(authenticate);

// ---- GET Grades ----
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { studentId, classId, subjectId, termId } = req.query;

    const whereClause: any = {
      schoolId,
      isDeleted: false,
    };

    if (req.user!.role === 'student') {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.user!.userId, isDeleted: false },
      });
      whereClause.studentId = profile?.id ?? 'none';
      whereClause.isPublished = true;
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
      whereClause.isPublished = true;
    } else {
      if (studentId && typeof studentId === 'string') {
        whereClause.studentId = studentId;
      }
    }
    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }
    if (subjectId && typeof subjectId === 'string') {
      whereClause.subjectId = subjectId;
    }
    if (termId && typeof termId === 'string') {
      whereClause.termId = termId;
    }

    const grades = await prisma.grade.findMany({
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
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        class: {
          select: {
            id: true,
            displayName: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        student: {
          admissionNumber: 'asc',
        },
      },
    });

    sendSuccess(res, grades, 'Grades retrieved successfully');
  })
);

// ---- Enter/Save Grades (Draft) ----
router.post(
  '/enter',
  requireRoles('head_teacher', 'teacher'),
  validateBody(saveGradesSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const enteredBy = req.user!.userId;
    const { classId, subjectId, termId, academicYearId, grades } = req.body;

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, isDeleted: false },
      include: {
        gradingScale: {
          include: {
            rules: true,
          },
        },
      },
    });

    const subjectCaMax = subject?.caMax ?? 30;
    const subjectExamMax = subject?.examMax ?? 70;
    const rules = subject?.gradingScale?.rules || [];

    const savedGrades = [];
    for (const record of grades) {
      const caMark = record.caMark ?? null;
      const examMark = record.examMark ?? null;
      let totalMark = null;
      let gradeLetter = null;

      if (caMark !== null && (caMark < 0 || caMark > subjectCaMax)) {
        throw new ValidationError({ grades: [`CA mark ${caMark} exceeds subject limit of ${subjectCaMax}`] });
      }
      if (examMark !== null && (examMark < 0 || examMark > subjectExamMax)) {
        throw new ValidationError({ grades: [`Exam mark ${examMark} exceeds subject limit of ${subjectExamMax}`] });
      }

      if (caMark !== null || examMark !== null) {
        totalMark = (caMark ?? 0) + (examMark ?? 0);
        gradeLetter = calculateGrade(totalMark, rules);
      }

      const existing = await prisma.grade.findFirst({
        where: {
          studentId: record.studentId,
          subjectId,
          termId,
          isDeleted: false,
        },
      });

      if (existing) {
        if (existing.submissionStatus === GradeStatus.locked) {
          continue; // Skip updating locked grades
        }
        const updated = await prisma.grade.update({
          where: { id: existing.id },
          data: {
            caMark,
            caMax: subjectCaMax,
            examMark,
            examMax: subjectExamMax,
            totalMark,
            gradeLetter,
            enteredBy,
          },
        });
        savedGrades.push(updated);
      } else {
        const created = await prisma.grade.create({
          data: {
            schoolId,
            studentId: record.studentId,
            classId,
            subjectId,
            termId,
            academicYearId,
            caMark,
            caMax: subjectCaMax,
            examMark,
            examMax: subjectExamMax,
            totalMark,
            gradeLetter,
            submissionStatus: GradeStatus.draft,
            enteredBy,
          },
        });
        savedGrades.push(created);
      }
    }

    sendSuccess(res, savedGrades, 'Grades saved successfully as draft');
  })
);

// ---- CSV Marks Template Export ----
router.get(
  '/template',
  requireRoles('head_teacher', 'teacher'),
  asyncHandler(async (req, res) => {
    const { classId, subjectId, termId } = req.query;

    if (!classId || !subjectId || !termId) {
      throw new ValidationError({ query: ['classId, subjectId, and termId are required in query params'] });
    }

    const students = await prisma.studentProfile.findMany({
      where: { classId: classId as string, schoolId: req.user!.schoolId!, isDeleted: false },
      include: { user: true },
      orderBy: { user: { lastName: 'asc' } },
    });

    const existingGrades = await prisma.grade.findMany({
      where: {
        classId: classId as string,
        subjectId: subjectId as string,
        termId: termId as string,
        isDeleted: false,
      },
    });

    let csvContent = 'Student ID,Admission Number,First Name,Last Name,CA Mark,Exam Mark\n';

    for (const student of students) {
      const grade = existingGrades.find(g => g.studentId === student.id);
      const ca = grade?.caMark !== undefined && grade?.caMark !== null ? grade.caMark : '';
      const exam = grade?.examMark !== undefined && grade?.examMark !== null ? grade.examMark : '';
      
      const firstName = student.user.firstName.replace(/"/g, '""');
      const lastName = student.user.lastName.replace(/"/g, '""');
      
      csvContent += `"${student.id}","${student.admissionNumber}","${firstName}","${lastName}",${ca},${exam}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="marksheet_template_${classId}.csv"`);
    res.status(200).send(csvContent);
  })
);

// ---- CSV Marks Import ----
router.post(
  '/import',
  requireRoles('head_teacher', 'teacher'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const enteredBy = req.user!.userId;
    const { classId, subjectId, termId, academicYearId, grades } = req.body;

    if (!classId || !subjectId || !termId || !academicYearId || !Array.isArray(grades)) {
      throw new ValidationError({ body: ['classId, subjectId, termId, academicYearId, and grades (array) are required'] });
    }

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, isDeleted: false },
      include: {
        gradingScale: {
          include: {
            rules: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundError('Subject');
    }

    const subjectCaMax = subject.caMax ?? 30;
    const subjectExamMax = subject.examMax ?? 70;
    const rules = subject.gradingScale?.rules || [];

    const classStudents = await prisma.studentProfile.findMany({
      where: { classId, schoolId, isDeleted: false },
      select: { id: true },
    });
    const classStudentIds = new Set(classStudents.map(s => s.id));

    const savedGrades = [];
    const errors: string[] = [];

    for (const record of grades) {
      if (!classStudentIds.has(record.studentId)) {
        errors.push(`Student with ID ${record.studentId} is not enrolled in this class`);
        continue;
      }

      const caMark = record.caMark !== undefined && record.caMark !== null && record.caMark !== '' ? parseFloat(record.caMark) : null;
      const examMark = record.examMark !== undefined && record.examMark !== null && record.examMark !== '' ? parseFloat(record.examMark) : null;

      if (caMark !== null && (caMark < 0 || caMark > subjectCaMax)) {
        errors.push(`CA mark ${caMark} exceeds max limit of ${subjectCaMax}`);
        continue;
      }
      if (examMark !== null && (examMark < 0 || examMark > subjectExamMax)) {
        errors.push(`Exam mark ${examMark} exceeds max limit of ${subjectExamMax}`);
        continue;
      }

      let totalMark = null;
      let gradeLetter = null;

      if (caMark !== null || examMark !== null) {
        totalMark = (caMark ?? 0) + (examMark ?? 0);
        gradeLetter = calculateGrade(totalMark, rules);
      }

      const existing = await prisma.grade.findFirst({
        where: {
          studentId: record.studentId,
          subjectId,
          termId,
          isDeleted: false,
        },
      });

      if (existing) {
        if (existing.submissionStatus === GradeStatus.locked) {
          continue;
        }
        const updated = await prisma.grade.update({
          where: { id: existing.id },
          data: {
            caMark,
            caMax: subjectCaMax,
            examMark,
            examMax: subjectExamMax,
            totalMark,
            gradeLetter,
            enteredBy,
          },
        });
        savedGrades.push(updated);
      } else {
        const created = await prisma.grade.create({
          data: {
            schoolId,
            studentId: record.studentId,
            classId,
            subjectId,
            termId,
            academicYearId,
            caMark,
            caMax: subjectCaMax,
            examMark,
            examMax: subjectExamMax,
            totalMark,
            gradeLetter,
            submissionStatus: GradeStatus.draft,
            enteredBy,
          },
        });
        savedGrades.push(created);
      }
    }

    if (errors.length > 0 && savedGrades.length === 0) {
      throw new ValidationError({ grades: errors });
    }

    sendSuccess(res, { importedCount: savedGrades.length, errors }, 'Grades imported successfully');
  })
);

// ---- Submit Grades for Approval ----
router.patch(
  '/submit',
  requireRoles('head_teacher', 'teacher'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, subjectId, termId } = req.body;

    if (!classId || !subjectId || !termId) {
      throw new ValidationError({ body: ['classId, subjectId, and termId are required in request body'] });
    }

    const updated = await prisma.grade.updateMany({
      where: {
        schoolId,
        classId,
        subjectId,
        termId,
        submissionStatus: GradeStatus.draft,
        isDeleted: false,
      },
      data: {
        submissionStatus: GradeStatus.submitted,
      },
    });

    sendSuccess(res, updated, 'Grades submitted for approval');
  })
);

// ---- Approve or Reject Grades ----
router.patch(
  '/approve',
  requireRoles('head_teacher', 'deputy_head'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const approvedBy = req.user!.userId;
    const { classId, subjectId, termId, status, rejectionComment } = req.body;

    if (!classId || !subjectId || !termId || !status) {
      throw new ValidationError({ body: ['classId, subjectId, termId, and status are required'] });
    }

    if (status !== 'approved' && status !== 'draft') {
      throw new ValidationError({ status: ['status must be approved or draft (for rejection)'] });
    }

    if (status === 'draft' && !rejectionComment) {
      throw new ValidationError({ rejectionComment: ['rejectionComment is required when status is draft'] });
    }

    const result = await prisma.$transaction(async (tx) => {
      if (status === 'approved') {
        // Approve grades
        await tx.grade.updateMany({
          where: {
            schoolId,
            classId,
            subjectId,
            termId,
            submissionStatus: GradeStatus.submitted,
            isDeleted: false,
          },
          data: {
            submissionStatus: GradeStatus.approved,
            approvedBy,
          },
        });

        // Compute rankings
        const allGrades = await tx.grade.findMany({
          where: { schoolId, classId, subjectId, termId, isDeleted: false },
        });

        const validGrades = allGrades.filter(g => g.totalMark !== null);
        const totals = validGrades.map(g => ({
          studentId: g.studentId,
          total: g.totalMark!,
        }));

        const ranked = calculatePositions(totals);

        for (const item of ranked) {
          await tx.grade.updateMany({
            where: { schoolId, studentId: item.studentId, subjectId, termId, isDeleted: false },
            data: { position: item.position },
          });
        }
      } else {
        // Reject grades
        await tx.grade.updateMany({
          where: {
            schoolId,
            classId,
            subjectId,
            termId,
            submissionStatus: GradeStatus.submitted,
            isDeleted: false,
          },
          data: {
            submissionStatus: GradeStatus.draft,
            rejectionComment,
            approvedBy: null,
          },
        });
      }

      return { status };
    });

    sendSuccess(res, result, status === 'approved' ? 'Grades approved and ranked' : 'Grades rejected back to draft');
  })
);

// ---- Publish/Unpublish Grades ----
router.patch(
  '/publish',
  requireRoles('head_teacher', 'deputy_head'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, termId, isPublished } = req.body;

    if (!classId || !termId || typeof isPublished !== 'boolean') {
      throw new ValidationError({ body: ['classId, termId, and isPublished (boolean) are required'] });
    }

    const updated = await prisma.grade.updateMany({
      where: {
        schoolId,
        classId,
        termId,
        submissionStatus: GradeStatus.approved,
        isDeleted: false,
      },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    sendSuccess(res, updated, `Grades ${isPublished ? 'published' : 'unpublished'} successfully`);
  })
);

export default router;
