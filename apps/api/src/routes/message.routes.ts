import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, NotFoundError } from '../utils/errors';
import { sendMessageSchema, replyMessageSchema } from '@tenpaten/shared';

const router = Router();
router.use(authenticate);

// ---- GET Inbox Messages ----
router.get(
  '/inbox',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const userId = req.user!.userId;

    const messages = await prisma.message.findMany({
      where: {
        schoolId,
        isDeleted: false,
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: {
          where: { isDeleted: false },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Simple thread filter: only return parent messages in main list, with replies nested inside
    const parentMessages = messages.filter(msg => !msg.parentId);

    sendSuccess(res, parentMessages, 'Inbox retrieved successfully');
  })
);

// ---- POST Send Message ----
router.post(
  '/',
  validateBody(sendMessageSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const senderId = req.user!.userId;
    const { recipientId, subject, body, classId, isBroadcast } = req.body;

    const message = await prisma.message.create({
      data: {
        schoolId,
        senderId,
        recipientId: recipientId || null,
        classId: classId || null,
        isBroadcast: isBroadcast || false,
        subject,
        body,
      },
    });

    sendSuccess(res, message, 'Message sent successfully', 201);
  })
);

// ---- POST Reply Message ----
router.post(
  '/:id/reply',
  validateBody(replyMessageSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const senderId = req.user!.userId;
    const { id } = req.params;
    const { body } = req.body;

    const parentMessage = await prisma.message.findFirst({
      where: { id, schoolId, isDeleted: false },
    });

    if (!parentMessage) {
      throw new NotFoundError('Conversation thread');
    }

    // Recipient of reply is the sender of the parent message (or the other participant)
    const recipientId = parentMessage.senderId === senderId ? parentMessage.recipientId : parentMessage.senderId;

    const reply = await prisma.message.create({
      data: {
        schoolId,
        senderId,
        recipientId,
        parentId: id,
        subject: `Re: ${parentMessage.subject}`,
        body,
      },
    });

    sendSuccess(res, reply, 'Reply sent successfully', 201);
  })
);

export default router;
