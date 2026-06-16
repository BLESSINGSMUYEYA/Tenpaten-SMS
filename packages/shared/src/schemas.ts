import { z } from 'zod';

// ---- Password ----

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ---- Auth ----

export const loginSchema = z.object({
  schoolCode: z
    .string()
    .min(1, 'School code is required')
    .regex(/^[A-Z]{2,5}-\d{4}-\d{4}$/, 'Invalid school code format (e.g. SJP-2025-4821)'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  schoolCode: z.string().min(1, 'School code is required'),
});

export const resetPasswordBaseSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
});

export const resetPasswordSchema = resetPasswordBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ---- School ----

export const MALAWI_DISTRICTS = [
  'Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa',
  'Dedza', 'Dowa', 'Karonga', 'Kasungu', 'Likoma',
  'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji', 'Mulanje',
  'Mwanza', 'Mzimba', 'Neno', 'Nkhata Bay', 'Nkhotakota',
  'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe', 'Rumphi',
  'Salima', 'Thyolo', 'Zomba',
] as const;

export const createSchoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters'),
  type: z.enum(['secondary', 'primary', 'mixed']),
  district: z.enum(MALAWI_DISTRICTS),
  country: z.string().default('Malawi'),
  headTeacher: z.object({
    firstName: z.string().min(2, 'First name required'),
    lastName: z.string().min(2, 'Last name required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
  }),
});

export const updateSchoolProfileSchema = z.object({
  name: z.string().min(3).optional(),
  address: z.string().optional(),
  district: z.enum(MALAWI_DISTRICTS).optional(),
  motto: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  logoUrl: z.string().url().optional(),
});

// ---- Academic Year & Terms ----

export const createAcademicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCurrent: z.boolean().default(false),
});

export const createTermSchema = z.object({
  academicYearId: z.string().uuid(),
  name: z.string().min(1, 'Term name is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCurrent: z.boolean().default(false),
});

// ---- Classes ----

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  stream: z.string().optional(),
  academicYearId: z.string().uuid(),
});

// ---- Subjects ----

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required').max(10),
  isCore: z.boolean().default(true),
  gradingScaleId: z.string().uuid().optional().nullable(),
  caMax: z.number().min(0).max(100).optional().nullable(),
  examMax: z.number().min(0).max(100).optional().nullable(),
});

export const createGradingScaleSchema = z.object({
  name: z.string().min(1, 'Grading scale name is required'),
  isDefault: z.boolean().default(false),
  rules: z.array(
    z.object({
      gradeSymbol: z.string().min(1, 'Symbol is required'),
      minPercentage: z.number().min(0).max(100),
      maxPercentage: z.number().min(0).max(100),
      classification: z.string().min(1, 'Classification is required'),
    })
  ).min(1, 'At least one rule is required'),
});

export type CreateGradingScaleInput = z.infer<typeof createGradingScaleSchema>;


export const assignSubjectSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid().optional(),
});

// ---- Staff ----

export const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.enum(['head_teacher', 'deputy_head', 'teacher', 'bursar']),
  photoUrl: z.string().url().optional(),
});

// ---- Students ----

export const createStudentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  photoUrl: z.string().url().optional(),
  classId: z.string().uuid(),
  boardingStatus: z.enum(['day', 'boarding']).default('day'),
  enrollmentDate: z.string().datetime().optional(),
  guardian: z.object({
    fullName: z.string().min(2),
    relationship: z.string().min(1),
    phone: z.string().min(10),
    email: z.string().email().optional(),
  }),
});

// ---- Timetable ----

export const createTimetableSlotSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  periodNumber: z.number().int().min(1).max(10),
  room: z.string().optional(),
  termId: z.string().uuid(),
});

// ---- Attendance ----

export const markAttendanceSchema = z.object({
  classId: z.string().uuid(),
  termId: z.string().uuid(),
  date: z.string(),
  type: z.enum(['morning', 'period']),
  subjectId: z.string().uuid().optional(),
  periodNumber: z.number().int().optional(),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['present', 'absent', 'late']),
      reason: z.string().optional(),
    })
  ),
});

// ---- Grades ----

export const saveGradesSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  termId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  grades: z.array(
    z.object({
      studentId: z.string().uuid(),
      caMark: z.number().min(0).optional(),
      examMark: z.number().min(0).optional(),
    })
  ),
});

// ---- Fees ----

export const createFeeStructureSchema = z.object({
  classId: z.string().uuid(),
  termId: z.string().uuid(),
  items: z.array(
    z.object({
      itemName: z.string().min(1),
      amount: z.number().positive(),
    })
  ),
});

export const recordPaymentSchema = z.object({
  studentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentDate: z.string(),
  method: z.enum(['cash', 'mobile_money', 'bank', 'cheque']),
  referenceNumber: z.string().optional(),
});

// ---- Announcements ----

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  body: z.string().min(10, 'Message must be at least 10 characters'),
  audience: z.enum(['all', 'staff', 'students', 'parents', 'class']),
  classId: z.string().uuid().optional(),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  isPublished: z.boolean().default(true),
});

// ---- Messages ----

export const sendMessageSchema = z.object({
  recipientId: z.string().uuid().optional(),
  classId: z.string().uuid().optional(),
  isBroadcast: z.boolean().default(false),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Message body is required'),
});

export const replyMessageSchema = z.object({
  body: z.string().min(1, 'Reply cannot be empty'),
});

// ---- Type Exports ----

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>;
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type CreateTermInput = z.infer<typeof createTermSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type AssignSubjectInput = z.infer<typeof assignSubjectSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type CreateTimetableSlotInput = z.infer<typeof createTimetableSlotSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type SaveGradesInput = z.infer<typeof saveGradesSchema>;
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
