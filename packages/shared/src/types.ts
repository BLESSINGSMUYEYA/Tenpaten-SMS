// ============================================================
// MYKLASI SMS — Shared Types
// Used by both API and Web packages
// ============================================================

// ---- Enums ----

export type SchoolType = 'secondary' | 'primary' | 'mixed';

export type UserRole =
  | 'super_admin'
  | 'head_teacher'
  | 'deputy_head'
  | 'teacher'
  | 'bursar'
  | 'student'
  | 'parent'
  | 'it_coordinator'
  | 'school_director'
  | 'director';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export type StudentStatus =
  | 'active'
  | 'suspended_fees'
  | 'suspended_discipline'
  | 'graduated'
  | 'withdrawn';

export type AttendanceType = 'morning' | 'period';
export type AttendanceStatus = 'present' | 'absent' | 'late';

export type GradeStatus = 'draft' | 'submitted' | 'approved' | 'locked';

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'mobile_money' | 'bank' | 'cheque';

export type AnnouncementAudience = 'all' | 'staff' | 'students' | 'parents' | 'class';
export type AnnouncementPriority = 'normal' | 'urgent';

export type NotificationType = 'sms' | 'email' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

// ---- Base Model ----

export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// ---- School ----

export interface School extends BaseModel {
  name: string;
  type: SchoolType;
  district: string;
  country: string;
  logoUrl?: string;
  motto?: string;
  address?: string;
  phone?: string;
  email?: string;
  schoolCode: string;
  subscriptionPlan: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  isActive: boolean;
  setupComplete: boolean;
}

// ---- User ----

export interface User extends BaseModel {
  schoolId?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  username?: string | null;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: string;
  photoUrl?: string;
  school?: School;
}

export interface UserWithToken extends User {
  accessToken: string;
}

// ---- Academic Year & Terms ----

export interface AcademicYear extends BaseModel {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms?: Term[];
}

export interface Term extends BaseModel {
  schoolId: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  academicYear?: AcademicYear;
}

// ---- Classes & Subjects ----

export interface Class extends BaseModel {
  schoolId: string;
  name: string;
  stream?: string;
  displayName: string;
  academicYearId: string;
  academicYear?: AcademicYear;
}

export interface Subject extends BaseModel {
  schoolId: string;
  name: string;
  code: string;
  isCore: boolean;
}

export interface ClassSubject extends BaseModel {
  classId: string;
  subjectId: string;
  teacherId?: string;
  class?: Class;
  subject?: Subject;
  teacher?: User;
}

// ---- Timetable ----

export interface TimetableSlot extends BaseModel {
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  day: DayOfWeek;
  periodNumber: number;
  room?: string;
  termId: string;
  class?: Class;
  subject?: Subject;
  teacher?: User;
  term?: Term;
}

// ---- Student ----

export interface StudentProfile extends BaseModel {
  userId: string;
  schoolId: string;
  admissionNumber: string;
  classId: string;
  dateOfBirth?: string;
  gender?: string;
  boardingStatus: string;
  enrollmentDate: string;
  status: StudentStatus;
  user?: User;
  class?: Class;
}

export interface ParentStudent extends BaseModel {
  parentUserId: string;
  studentUserId: string;
  relationship: string;
  parent?: User;
  student?: User;
}

// ---- Attendance ----

export interface Attendance extends BaseModel {
  schoolId: string;
  studentId: string;
  classId: string;
  subjectId?: string;
  type: AttendanceType;
  date: string;
  periodNumber?: number;
  status: AttendanceStatus;
  reason?: string;
  markedBy: string;
  termId: string;
  isLocked: boolean;
  student?: StudentProfile;
  subject?: Subject;
}

// ---- Grades ----

export interface Grade extends BaseModel {
  schoolId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  termId: string;
  academicYearId: string;
  caMark?: number;
  caMax: number;
  examMark?: number;
  examMax: number;
  totalMark?: number;
  gradeLetter?: string;
  position?: number;
  submissionStatus: GradeStatus;
  enteredBy: string;
  approvedBy?: string;
  lockedAt?: string;
  rejectionComment?: string;
  student?: StudentProfile;
  subject?: Subject;
}

// ---- Fees ----

export interface FeeStructure extends BaseModel {
  schoolId: string;
  classId: string;
  termId: string;
  itemName: string;
  amount: number;
  isLocked: boolean;
  class?: Class;
  term?: Term;
}

export interface Invoice extends BaseModel {
  schoolId: string;
  studentId: string;
  termId: string;
  totalAmount: number;
  discountAmount: number;
  discountReason?: string;
  finalAmount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  payments?: Payment[];
  student?: StudentProfile;
  term?: Term;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemName: string;
  amount: number;
}

export interface Payment extends BaseModel {
  schoolId: string;
  studentId: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  receivedBy: string;
  receiptNumber: string;
  isVoided: boolean;
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  student?: StudentProfile;
  invoice?: Invoice;
}

// ---- Communication ----

export interface Announcement extends BaseModel {
  schoolId: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  classId?: string;
  priority: AnnouncementPriority;
  postedBy: string;
  isPublished: boolean;
  publishedAt?: string;
  poster?: User;
  class?: Class;
}

export interface Message extends BaseModel {
  schoolId: string;
  senderId: string;
  recipientId?: string;
  classId?: string;
  isBroadcast: boolean;
  subject: string;
  body: string;
  readAt?: string;
  parentId?: string;
  sender?: User;
  recipient?: User;
  replies?: Message[];
}

export interface Notification extends BaseModel {
  schoolId: string;
  userId: string;
  type: NotificationType;
  subject?: string;
  message: string;
  status: NotificationStatus;
  sentAt?: string;
  retryCount: number;
  user?: User;
}

// ---- API Responses ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Auth ----

export interface LoginResponse {
  user: User;
  accessToken: string;
  mustChangePassword: boolean;
}

export interface JwtPayload {
  jti: string;           // Unique token ID — used to revoke individual tokens
  userId: string;
  schoolId?: string;
  role: UserRole;
  email?: string | null;
  tokenVersion?: number; // Checked at refresh time; increment to invalidate all sessions
  family?: string;       // Refresh token rotation chain ID (refresh tokens only)
  iat?: number;
  exp?: number;
}

// ---- Dashboard Stats ----

export interface SuperAdminStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  schoolsExpiringSoon: number;
}

export interface HeadTeacherStats {
  totalStudents: number;
  todayAttendancePercent: number;
  feeCollectionPercent: number;
  totalStaff: number;
  lowAttendanceCount: number;
  pendingGradeSubmissions: number;
  unpaidFeesCount: number;
}

// ---- Finance Models ----

export interface FeeStructure extends BaseModel {
  schoolId: string;
  classId: string;
  termId: string;
  tuitionFee: number;
  boardingFee: number;
  otherFee: number;
  totalAmount: number;
  class?: Class;
  term?: Term;
}

export interface Invoice extends BaseModel {
  schoolId: string;
  studentId: string;
  termId: string;
  feeStructureId?: string;
  amountBilled: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  student?: StudentProfile;
  term?: Term;
}

export interface FeePayment extends BaseModel {
  schoolId: string;
  invoiceId: string;
  amount: number;
  receiptNumber: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  recordedBy: string;
  invoice?: Invoice;
  recordedByUser?: User;
}

export interface BursarStats {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  recentPaymentsCount: number;
  activeBillingStudents: number;
}

