import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { asyncHandler, sendSuccess, ValidationError, NotFoundError } from '../utils/errors';
import { smsService } from '../services/sms.service';

const router = Router();

// Require authentication for all finance routes
router.use(authenticate);

// ─── GET /api/finance/stats ──────────────────────────────────────────────────
// Retrieve summary of institutional finances
router.get(
  '/stats',
  requireRoles('head_teacher', 'bursar', 'school_director', 'director'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;

    // Aggregates of non-deleted invoices
    const invoices = await prisma.invoice.findMany({
      where: { schoolId, isDeleted: false },
      select: {
        amountBilled: true,
        amountPaid: true,
        balance: true,
      },
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amountBilled, 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;

    // Count of payments in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPaymentsCount = await prisma.feePayment.count({
      where: {
        schoolId,
        isDeleted: false,
        paymentDate: { gte: thirtyDaysAgo },
      },
    });

    // Count of active billed students
    const activeBillingStudents = await prisma.studentProfile.count({
      where: {
        schoolId,
        isDeleted: false,
        status: 'active',
      },
    });

    sendSuccess(res, {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      collectionRate,
      recentPaymentsCount,
      activeBillingStudents,
    }, 'Finance statistics calculated successfully');
  })
);

// ─── GET /api/finance/structures ─────────────────────────────────────────────
// Retrieve defined class fee structures
router.get(
  '/structures',
  requireRoles('director', 'school_director', 'head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const structures = await prisma.feeStructure.findMany({
      where: { schoolId, isDeleted: false },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            academicYear: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, structures, 'Fee structures retrieved successfully');
  })
);

// ─── POST /api/finance/structures ────────────────────────────────────────────
// Create or update class fee structure
router.post(
  '/structures',
  requireRoles('director', 'school_director', 'head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, termId, tuitionFee, boardingFee, otherFee } = req.body;

    if (!classId || !termId || tuitionFee === undefined) {
      throw new ValidationError({
        body: ['classId, termId, and tuitionFee are required in the request body'],
      });
    }

    const tFee = parseFloat(tuitionFee);
    const bFee = parseFloat(boardingFee || 0);
    const oFee = parseFloat(otherFee || 0);
    const totalAmount = tFee + bFee + oFee;

    // Check if class exists
    const classExists = await prisma.class.findFirst({
      where: { id: classId, schoolId, isDeleted: false },
    });
    if (!classExists) throw new NotFoundError('Class');

    // Check if term exists
    const termExists = await prisma.term.findFirst({
      where: { id: termId, schoolId, isDeleted: false },
    });
    if (!termExists) throw new NotFoundError('Term');

    // Upsert structure
    const existing = await prisma.feeStructure.findFirst({
      where: { classId, termId, schoolId, isDeleted: false },
    });

    let structure;
    if (existing) {
      structure = await prisma.feeStructure.update({
        where: { id: existing.id },
        data: {
          tuitionFee: tFee,
          boardingFee: bFee,
          otherFee: oFee,
          totalAmount,
        },
      });
    } else {
      structure = await prisma.feeStructure.create({
        data: {
          schoolId,
          classId,
          termId,
          tuitionFee: tFee,
          boardingFee: bFee,
          otherFee: oFee,
          totalAmount,
        },
      });
    }

    sendSuccess(res, structure, 'Fee structure configured successfully', existing ? 200 : 201);
  })
);

// ─── GET /api/finance/invoices ───────────────────────────────────────────────
// Fetch invoices with role-based visibility filtering
router.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const userRole = req.user!.role;
    const userId = req.user!.userId;
    const schoolId = req.user!.schoolId;

    const whereClause: any = { isDeleted: false };

    // Apply tenant/school isolation if not super_admin
    if (userRole !== 'super_admin') {
      whereClause.schoolId = schoolId;
    }

    // Role-based visibility scoping
    if (userRole === 'student') {
      const profile = await prisma.studentProfile.findFirst({
        where: { userId, isDeleted: false },
      });
      whereClause.studentId = profile?.id ?? 'none';
    } else if (userRole === 'parent') {
      const relations = await prisma.parentStudent.findMany({
        where: { parentUserId: userId, isDeleted: false },
      });
      const studentProfiles = await prisma.studentProfile.findMany({
        where: { userId: { in: relations.map(r => r.studentUserId) }, isDeleted: false },
      });
      whereClause.studentId = {
        in: studentProfiles.map(p => p.id),
      };
    } else if (userRole === 'teacher') {
      // Teachers cannot view financial data
      throw new ValidationError({ role: ['Access denied. Teachers do not have permission to view billing data.'] });
    }

    // Filter parameters
    const { classId, termId, status, studentId } = req.query;
    if (classId && typeof classId === 'string') {
      whereClause.student = { classId };
    }
    if (termId && typeof termId === 'string') {
      whereClause.termId = termId;
    }
    if (status && typeof status === 'string') {
      whereClause.status = status;
    }
    if (studentId && typeof studentId === 'string') {
      whereClause.studentId = studentId;
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                photoUrl: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        term: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, invoices, 'Invoices retrieved successfully');
  })
);

// ─── POST /api/finance/invoices/generate ─────────────────────────────────────
// Generate bulk billing invoices for a class and active term
router.post(
  '/invoices/generate',
  requireRoles('director', 'school_director', 'head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { classId, termId } = req.body;

    if (!classId || !termId) {
      throw new ValidationError({
        body: ['classId and termId are required in the request body'],
      });
    }

    // POLICY Check: "restrict billing until defined"
    const feeStructure = await prisma.feeStructure.findFirst({
      where: { classId, termId, schoolId, isDeleted: false },
    });

    if (!feeStructure) {
      throw new ValidationError({
        feeStructure: ['No fee structure is defined for this class and term. Invoices cannot be generated. Please define a fee structure first.'],
      });
    }

    // Fetch all active students in this class
    const students = await prisma.studentProfile.findMany({
      where: { classId, schoolId, status: 'active', isDeleted: false },
    });

    if (students.length === 0) {
      return sendSuccess(res, [], 'No active students found in this class to bill.');
    }

    const createdInvoices = [];
    for (const student of students) {
      // Check if student is already billed for this term
      const existing = await prisma.invoice.findFirst({
        where: { studentId: student.id, termId, schoolId, isDeleted: false },
      });

      if (existing) continue; // Skip already billed students

      // Calculate bill based on boarding status
      const tuition = feeStructure.tuitionFee;
      const boarding = student.boardingStatus === 'boarding' ? feeStructure.boardingFee : 0;
      const other = feeStructure.otherFee;
      const billed = tuition + boarding + other;

      const invoice = await prisma.invoice.create({
        data: {
          schoolId,
          studentId: student.id,
          termId,
          feeStructureId: feeStructure.id,
          amountBilled: billed,
          amountPaid: 0,
          balance: billed,
          status: 'unpaid',
        },
      });

      createdInvoices.push(invoice);
    }

    sendSuccess(res, createdInvoices, `Successfully generated invoices for ${createdInvoices.length} students.`, 201);
  })
);

// ─── GET /api/finance/payments ───────────────────────────────────────────────
// Fetch recent payment transactions
router.get(
  '/payments',
  requireRoles('director', 'school_director', 'head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const { invoiceId } = req.query;

    const whereClause: any = { schoolId, isDeleted: false };
    if (invoiceId && typeof invoiceId === 'string') {
      whereClause.invoiceId = invoiceId;
    }

    const payments = await prisma.feePayment.findMany({
      where: whereClause,
      include: {
        invoice: {
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
                class: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
              },
            },
          },
        },
        recordedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    sendSuccess(res, payments, 'Payment transactions ledger retrieved successfully');
  })
);

// ─── POST /api/finance/payments ──────────────────────────────────────────────
// Record a fee payment receipt and dispatch parent SMS
router.post(
  '/payments',
  requireRoles('director', 'school_director', 'head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const recordedBy = req.user!.userId;
    const { invoiceId, amount, paymentMethod, referenceNumber, paymentDate } = req.body;

    if (!invoiceId || amount === undefined || !paymentMethod) {
      throw new ValidationError({
        body: ['invoiceId, amount, and paymentMethod are required in the request body'],
      });
    }

    const payAmount = parseFloat(amount);
    if (payAmount <= 0) {
      throw new ValidationError({
        amount: ['Payment amount must be greater than zero.'],
      });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, schoolId, isDeleted: false },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                studentRelations: {
                  where: { isDeleted: false },
                  include: {
                    parent: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) throw new NotFoundError('Invoice');

    if (payAmount > invoice.balance) {
      throw new ValidationError({
        amount: [`Payment amount (MK ${payAmount.toLocaleString()}) exceeds the outstanding balance (MK ${invoice.balance.toLocaleString()})`],
      });
    }

    // Generate unique receipt number (REC-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000).toString();
    const receiptNumber = `REC-${dateStr}-${randStr}`;

    const result = await prisma.$transaction(async (tx) => {
      // Record payment
      const payment = await tx.feePayment.create({
        data: {
          schoolId,
          invoiceId,
          amount: payAmount,
          receiptNumber,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          paymentMethod,
          referenceNumber: referenceNumber || null,
          recordedBy,
        },
      });

      // Update invoice values
      const newPaid = invoice.amountPaid + payAmount;
      const newBalance = invoice.balance - payAmount;
      const status = newBalance === 0 ? 'paid' : 'partial';

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newPaid,
          balance: newBalance,
          status,
        },
      });

      return { payment, newBalance };
    });

    // Send SMS alert to parent in background (if parent phone is available)
    const parentRelation = invoice.student.user.studentRelations[0];
    const parentPhone = parentRelation?.parent?.phone;
    
    if (parentPhone) {
      const studentName = `${invoice.student.user.firstName} ${invoice.student.user.lastName}`;
      const smsMessage = `Dear Parent, we have received MK ${payAmount.toLocaleString()} for ${studentName}'s Term fees. Receipt: ${receiptNumber}. Outstanding Balance: MK ${result.newBalance.toLocaleString()}. Thank you, MyKlasi.`;
      
      smsService.sendSms({ to: parentPhone, message: smsMessage }).catch(err => {
        console.error('[SMS Dispatch Error] Parent payment confirmation SMS failed:', err);
      });
    }

    sendSuccess(res, result.payment, 'Payment transaction recorded successfully', 201);
  })
);

// ─── POST /api/finance/invoices/:id/reminder ─────────────────────────────────
// Trigger a manual SMS reminder to the parent for outstanding balances
router.post(
  '/invoices/:id/reminder',
  requireRoles('director', 'school_director', 'head_teacher', 'bursar'),
  asyncHandler(async (req, res) => {
    const schoolId = req.user!.schoolId!;
    const invoiceId = req.params.id;

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, schoolId, isDeleted: false },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                studentRelations: {
                  where: { isDeleted: false },
                  include: {
                    parent: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        term: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invoice) throw new NotFoundError('Invoice');

    if (invoice.balance <= 0) {
      throw new ValidationError({
        balance: ['This invoice is already fully paid. No reminder is required.'],
      });
    }

    const parentRelation = invoice.student.user.studentRelations[0];
    const parentPhone = parentRelation?.parent?.phone;

    if (!parentPhone) {
      throw new ValidationError({
        parent: ['No parent phone number registered for this student. Cannot send SMS reminder.'],
      });
    }

    const studentName = `${invoice.student.user.firstName} ${invoice.student.user.lastName}`;
    const termName = invoice.term.name;
    const balanceFormatted = invoice.balance.toLocaleString();

    const smsMessage = `Dear Parent, please note that ${studentName} has an outstanding fee balance of MK ${balanceFormatted} for ${termName}. Please settle this balance as soon as possible. Thank you, MyKlasi.`;

    const smsResult = await smsService.sendSms({ to: parentPhone, message: smsMessage });

    if (!smsResult.success) {
      throw new ValidationError({
        sms: [smsResult.error || 'Failed to dispatch SMS through the gateway.'],
      });
    }

    sendSuccess(res, null, `Fee reminder SMS successfully dispatched to parent at ${parentPhone}`);
  })
);

export default router;
