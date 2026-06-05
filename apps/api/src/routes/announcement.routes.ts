import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess } from '../utils/errors';
import { createAnnouncementSchema } from '@tenpaten/shared';
import { AnnouncementAudience, AnnouncementPriority, UserRole } from '@prisma/client';

const router = Router();
router.use(authenticate);

// ---- GET Announcements ----
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const role = req.user!.role;
    const userId = req.user!.userId;

    const audienceList: AnnouncementAudience[] = [AnnouncementAudience.all];

    // Determine audiences matching role
    if (([UserRole.head_teacher, UserRole.deputy_head, UserRole.teacher, UserRole.bursar] as UserRole[]).includes(role)) {
      audienceList.push(AnnouncementAudience.staff);
    }
    if (role === UserRole.student) {
      audienceList.push(AnnouncementAudience.students);
    }
    if (role === UserRole.parent) {
      audienceList.push(AnnouncementAudience.parents);
    }

    const whereClause: any = {
      schoolId,
      isDeleted: false,
    };

    // If user is a student, we also show class specific announcements
    let studentClassId: string | null = null;
    if (role === UserRole.student) {
      const studentProfile = await prisma.studentProfile.findFirst({
        where: { userId, isDeleted: false },
      });
      studentClassId = studentProfile?.classId ?? null;
    } else if (role === UserRole.parent) {
      // Parents can see their children's class announcements
      const childRelations = await prisma.parentStudent.findMany({
        where: { parentUserId: userId, isDeleted: false },
      });
      const childProfiles = await prisma.studentProfile.findMany({
        where: { userId: { in: childRelations.map(r => r.studentUserId) }, isDeleted: false },
      });
      const classIds = childProfiles.map(p => p.classId);
      if (classIds.length > 0) {
        whereClause.OR = [
          { audience: { in: audienceList } },
          { audience: AnnouncementAudience.class, classId: { in: classIds } },
        ];
      }
    }

    if (studentClassId) {
      whereClause.OR = [
        { audience: { in: audienceList } },
        { audience: AnnouncementAudience.class, classId: studentClassId },
      ];
    } else if (!whereClause.OR) {
      whereClause.audience = { in: audienceList };
    }

    // Only staff can view drafts
    if (!([UserRole.head_teacher, UserRole.deputy_head, UserRole.teacher] as UserRole[]).includes(role)) {
      whereClause.isPublished = true;
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        poster: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        class: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, announcements, 'Announcements retrieved successfully');
  })
);

// ---- POST Publish Announcement ----
router.post(
  '/',
  requireRoles('head_teacher', 'deputy_head', 'teacher'),
  validateBody(createAnnouncementSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const postedBy = req.user!.userId;
    const { title, body, audience, classId, priority, isPublished } = req.body;

    const newAnnouncement = await prisma.announcement.create({
      data: {
        schoolId,
        title,
        body,
        audience: audience as AnnouncementAudience,
        classId: audience === 'class' ? classId : null,
        priority: (priority as AnnouncementPriority) || AnnouncementPriority.normal,
        postedBy,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    sendSuccess(res, newAnnouncement, 'Announcement posted successfully', 201);
  })
);

export default router;
