import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { generateSchoolCode, generateReceiptNumber, DEFAULT_GRADING_SCALE } from '@tenpaten/shared';
import { prisma } from '../config/database';

// ---- School Code Generation ----

export function createSchoolCode(schoolName: string, customInitials?: string): string {
  const year = new Date().getFullYear();
  return generateSchoolCode(schoolName, year, customInitials);
}

/**
 * Generates a unique school code, retrying up to 5 times if a collision occurs.
 * Used during school onboarding to guarantee code uniqueness.
 */
export async function createUniqueSchoolCode(
  schoolName: string,
  customInitials?: string
): Promise<string> {
  const year = new Date().getFullYear();
  let attempts = 0;
  while (attempts < 5) {
    const code = generateSchoolCode(schoolName, year, customInitials);
    const existing = await prisma.school.findUnique({ where: { schoolCode: code } });
    if (!existing) return code;
    attempts++;
  }
  // Fallback: append timestamp suffix to guarantee uniqueness
  const fallback = generateSchoolCode(schoolName, year, customInitials);
  return `${fallback.slice(0, -4)}${Date.now().toString().slice(-4)}`;
}

// ---- Password Generation ----

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  // Ensure at least one uppercase, one number
  password += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
  password += '23456789'[Math.floor(Math.random() * 8)];
  for (let i = 0; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// ---- Admission Number Generation ----

export function generateAdmissionNumber(
  schoolCode: string,
  year: number,
  sequence: number
): string {
  const initials = schoolCode.split('-')[0];
  const padded = String(sequence).padStart(4, '0');
  return `${initials}/${year}/${padded}`;
}

// ---- Receipt Number Generation ----

export function createReceiptNumber(sequence: number): string {
  return generateReceiptNumber(sequence);
}

// ---- Password Reset Token ----

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ---- UUID ----

export { uuidv4 as generateId };

// ---- Grade Calculation ----

export function calculateGrade(totalMark: number): string {
  const entry = DEFAULT_GRADING_SCALE.find(
    (g) => totalMark >= g.min && totalMark <= g.max
  );
  return entry?.letter ?? 'F';
}

// ---- Position Calculation with tie-handling ----

export function calculatePositions(
  studentTotals: { studentId: string; total: number }[]
): { studentId: string; position: number }[] {
  const sorted = [...studentTotals].sort((a, b) => b.total - a.total);
  const positions: { studentId: string; position: number }[] = [];
  let currentPosition = 1;

  sorted.forEach((entry, index) => {
    if (index > 0 && entry.total < sorted[index - 1].total) {
      currentPosition = index + 1;
    }
    positions.push({ studentId: entry.studentId, position: currentPosition });
  });

  return positions;
}

// ---- Date Helpers ----

export function isWithin48Hours(date: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= 48 * 60 * 60 * 1000;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ---- Pagination ----

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export function getPaginationOptions(query: PaginationOptions) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
