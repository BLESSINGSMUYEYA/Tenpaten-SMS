import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { createReceiptNumber } from '../utils/helpers';
import { createFeeStructureSchema, recordPaymentSchema } from '@tenpaten/shared';
import { InvoiceStatus, PaymentMethod } from '@prisma/client';

const router = Router();
router.use(authenticate);

// ---- GET Fee Structures ----
router.get(
  '/fee-structures',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, termId } = req.query;

    const whereClause: any = {
      schoolId,
      isDeleted: false,
    };

    if (classId && typeof classId === 'string') {
      whereClause.classId = classId;
    }
    if (termId && typeof termId === 'string') {
      whereClause.termId = termId;
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where: whereClause,
      include: {
        class: { select: { id: true, displayName: true } },
        term: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, feeStructures, 'Fee structures retrieved successfully');
  })
);

// ---- POST Fee Structures ----
router.post(
  '/fee-structures',
  requireRoles('head_teacher', 'bursar'),
  validateBody(createFeeStructureSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, termId, items } = req.body;

    // Delete existing unlocked fee structures for class/term first to allow updates
    await prisma.feeStructure.deleteMany({
      where: {
        schoolId,
        classId,
        termId,
        isLocked: false,
      },
    });

    const createdItems = [];
    for (const item of items) {
      const entry = await prisma.feeStructure.create({
        data: {
          schoolId,
          classId,
          termId,
          itemName: item.itemName,
          amount: item.amount,
          isLocked: false,
        },
      });
      createdItems.push(entry);
    }

    // Now, let's proactively generate invoices for all students enrolled in this class!
    const students = await prisma.studentProfile.findMany({
      where: { schoolId, classId, isDeleted: false },
    });

    const totalAmount = items.reduce((sum: number, it: any) => sum + it.amount, 0);

    for (const std of students) {
      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findFirst({
        where: { studentId: std.id, termId, isDeleted: false },
      });

      if (!existingInvoice) {
        const invoice = await prisma.invoice.create({
          data: {
            schoolId,
            studentId: std.id,
            termId,
            totalAmount,
            discountAmount: 0,
            finalAmount: totalAmount,
            paidAmount: 0,
            balance: totalAmount,
            status: InvoiceStatus.unpaid,
          },
        });

        for (const item of items) {
          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              itemName: item.itemName,
              amount: item.amount,
            },
          });
        }
      }
    }

    sendSuccess(res, createdItems, 'Fee structures created and invoices initialized');
  })
);

// ---- GET Invoices ----
router.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { studentId, termId, status } = req.query;

    const whereClause: any = {
      schoolId,
      isDeleted: false,
    };

    if (studentId && typeof studentId === 'string') {
      whereClause.studentId = studentId;
    }
    if (termId && typeof termId === 'string') {
      whereClause.termId = termId;
    }
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    // If role is student or parent, enforce matching studentId
    if (req.user!.role === 'student') {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId: req.user!.userId, isDeleted: false },
      });
      whereClause.studentId = profile?.id ?? 'none';
    } else if (req.user!.role === 'parent') {
      const relations = await prisma.parentStudent.findMany({
        where: { parentUserId: req.user!.userId, isDeleted: false },
      });
      // Resolve parent → student user IDs → student profile IDs
      const studentProfiles = await prisma.studentProfile.findMany({
        where: { userId: { in: relations.map(r => r.studentUserId) } },
      });
      whereClause.studentId = {
        in: studentProfiles.map(p => p.id),
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            class: { select: { displayName: true } },
          },
        },
        term: { select: { id: true, name: true } },
        items: { where: { isDeleted: false } },
        payments: { where: { isDeleted: false, isVoided: false } },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, invoices, 'Invoices retrieved successfully');
  })
);

// ---- POST Record Payment ----
router.post(
  '/payments',
  requireRoles('head_teacher', 'bursar'),
  validateBody(recordPaymentSchema),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const receivedBy = req.user!.userId;
    const { studentId, invoiceId, amount, paymentDate, method, referenceNumber } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, schoolId, isDeleted: false },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    const receiptCount = await prisma.payment.count({
      where: { schoolId },
    });
    const receiptNumber = createReceiptNumber(receiptCount + 1);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          schoolId,
          studentId,
          invoiceId,
          amount,
          paymentDate: new Date(paymentDate),
          method: method as PaymentMethod,
          referenceNumber,
          receivedBy,
          receiptNumber,
        },
      });

      // 2. Recalculate Invoice Balances
      const newPaidAmount = invoice.paidAmount + amount;
      const newBalance = Math.max(0, invoice.finalAmount - newPaidAmount);
      let status: InvoiceStatus = InvoiceStatus.partial;

      if (newBalance <= 0) {
        status = InvoiceStatus.paid;
      } else if (newPaidAmount === 0) {
        status = InvoiceStatus.unpaid;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          status,
        },
      });

      return { payment, invoice: updatedInvoice };
    });

    sendSuccess(res, result, 'Payment recorded successfully', 201);
  })
);

// ---- PATCH Void Payment ----
router.patch(
  '/payments/:id/void',
  requireRoles('head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const voidedBy = req.user!.userId;
    const { id } = req.params;
    const { voidReason } = req.body;

    if (!voidReason) {
      throw new ValidationError({ voidReason: ['voidReason is required to void a payment'] });
    }

    const payment = await prisma.payment.findFirst({
      where: { id, schoolId, isDeleted: false, isVoided: false },
    });

    if (!payment) {
      throw new NotFoundError('Payment transaction');
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: payment.invoiceId, schoolId, isDeleted: false },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark payment voided
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          isVoided: true,
          voidReason,
          voidedBy,
          voidedAt: new Date(),
        },
      });

      // 2. Adjust Invoice balances
      const newPaidAmount = Math.max(0, invoice.paidAmount - payment.amount);
      const newBalance = invoice.finalAmount - newPaidAmount;
      let status: InvoiceStatus = InvoiceStatus.partial;

      if (newPaidAmount === 0) {
        status = InvoiceStatus.unpaid;
      } else if (newBalance <= 0) {
        status = InvoiceStatus.paid;
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balance: newBalance,
          status,
        },
      });

      return { payment: updatedPayment, invoice: updatedInvoice };
    });

    sendSuccess(res, result, 'Payment voided and invoice balance adjusted');
  })
);

export default router;
