import type { UserRole } from './types';

// ---- Grading Scale (Default Malawian Secondary) ----

export interface GradeScaleEntry {
  min: number;
  max: number;
  letter: string;
  remark: string;
}

export const DEFAULT_GRADING_SCALE: GradeScaleEntry[] = [
  { min: 80, max: 100, letter: 'A', remark: 'Excellent' },
  { min: 70, max: 79, letter: 'B', remark: 'Very Good' },
  { min: 60, max: 69, letter: 'C', remark: 'Good' },
  { min: 50, max: 59, letter: 'D', remark: 'Satisfactory' },
  { min: 40, max: 49, letter: 'E', remark: 'Pass' },
  { min: 0,  max: 39, letter: 'F', remark: 'Fail' },
];

export function getGradeLetter(percentage: number): string {
  const entry = DEFAULT_GRADING_SCALE.find(
    (g) => percentage >= g.min && percentage <= g.max
  );
  return entry?.letter ?? 'F';
}

export function getGradeRemark(percentage: number): string {
  const entry = DEFAULT_GRADING_SCALE.find(
    (g) => percentage >= g.min && percentage <= g.max
  );
  return entry?.remark ?? 'Fail';
}

// ---- Grade Calculation ----

export function calculateTotalMark(
  caMark: number,
  caMax: number,
  examMark: number,
  examMax: number
): number {
  const caWeighted = caMax > 0 ? (caMark / caMax) * 30 : 0;
  const examWeighted = examMax > 0 ? (examMark / examMax) * 70 : 0;
  return Math.round((caWeighted + examWeighted) * 100) / 100;
}

// ---- Role Labels ----

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  head_teacher: 'Head Teacher',
  deputy_head: 'Deputy Head Teacher',
  teacher: 'Teacher',
  bursar: 'Bursar',
  student: 'Student',
  parent: 'Parent',
};

// ---- Role Permissions ----
// Maps which roles can access which modules/actions

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['admin.*'],
  head_teacher: [
    'school.*', 'users.*', 'students.*', 'timetable.view',
    'attendance.*', 'grades.*', 'fees.view', 'fees.approve',
    'communication.*', 'reports.*',
  ],
  deputy_head: [
    'timetable.*', 'attendance.view', 'grades.view',
    'students.view', 'communication.announcements',
  ],
  teacher: [
    'timetable.view.own', 'attendance.mark.own', 'grades.enter.own',
    'communication.messages.own',
  ],
  bursar: ['fees.*', 'communication.announcements.view'],
  student: [
    'timetable.view.class', 'attendance.view.own', 'grades.view.own',
    'fees.view.own', 'communication.view',
  ],
  parent: [
    'timetable.view.child', 'attendance.view.child', 'grades.view.child',
    'fees.view.child', 'communication.view',
  ],
};

// ---- Attendance ----

export const ATTENDANCE_REASONS = [
  'Sick',
  'Family Emergency',
  'Unknown',
  'Other',
] as const;

// ---- Mobile Money Providers ----

export const MOBILE_MONEY_PROVIDERS = [
  'Airtel Money',
  'TNM Mpamba',
] as const;

export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  mobile_money: 'Mobile Money',
  bank: 'Bank Transfer',
  cheque: 'Cheque',
};

// ---- School Code Generator ----

export function generateSchoolCode(schoolName: string, year: number): string {
  const words = schoolName.split(' ').filter((w) => w.length > 1);
  const initials = words
    .slice(0, 4)
    .map((w) => w[0].toUpperCase())
    .join('');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${initials}-${year}-${random}`;
}

// ---- Receipt Number Generator ----

export function generateReceiptNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(5, '0');
  return `RCP-${year}-${padded}`;
}

// ---- Low Attendance Threshold ----

export const LOW_ATTENDANCE_THRESHOLD = 75; // percent

// ---- Periods ----

export const DEFAULT_PERIODS_PER_DAY = 8;
export const BREAK_PERIODS = [4]; // period numbers that are breaks
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

// ---- CA / Exam Defaults ----

export const DEFAULT_CA_MAX = 30;
export const DEFAULT_EXAM_MAX = 70;
