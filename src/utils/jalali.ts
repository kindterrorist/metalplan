import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const JALALI_MONTHS_SHORT = [
  "فرو", "اردی", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهم", "اسفند",
];

export const JALALI_DAY_NAMES = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
export const JALALI_DAY_NAMES_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/**
 * Convert a Date object or ISO string to Jalali date components
 */
export function toJalaliDate(input: Date | string): { jy: number; jm: number; jd: number } {
  const date = typeof input === "string" ? new Date(input) : input;
  return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/**
 * Get days in a Jalali month (correctly handles Esfand leap years)
 */
export function getJalaliMonthLength(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

/**
 * Format a date as Jalali: "۱۴۰۵/۰۳/۳۰"
 */
export function formatJalaliFull(input: Date | string): string {
  const { jy, jm, jd } = toJalaliDate(input);
  return `${jd.toString().padStart(2, "0")}/${jm.toString().padStart(2, "0")}/${jy}`;
}

/**
 * Format a date as short Jalali: "خرداد ۳۰"
 */
export function formatJalaliShort(input: Date | string): string {
  const { jy, jm, jd } = toJalaliDate(input);
  return `${JALALI_MONTHS[jm - 1]} ${jd}`;
}

/**
 * Format a date as chart label: "خرداد ۳۰" (short month + day)
 */
export function formatJalaliChartLabel(input: Date | string): string {
  const { jm, jd } = toJalaliDate(input);
  return `${JALALI_MONTHS_SHORT[jm - 1]} ${jd}`;
}

/**
 * Format a date with weekday: "شنبه ۱۴۰۵/۰۳/۳۰"
 */
export function formatJalaliWithWeekday(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const { jy, jm, jd } = toJalaliDate(date);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  // Convert to Jalali week: Saturday=0, Sunday=1, ..., Friday=6
  const jalaliDayIndex = (dayOfWeek + 1) % 7;
  return `${JALALI_DAY_NAMES[jalaliDayIndex]} ${jd.toString().padStart(2, "0")}/${jm.toString().padStart(2, "0")}/${jy}`;
}

/**
 * Get the Jalali day of week name
 */
export function getJalaliDayName(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const dayOfWeek = date.getDay();
  const jalaliDayIndex = (dayOfWeek + 1) % 7;
  return JALALI_DAY_NAMES[jalaliDayIndex];
}

/**
 * Relative time in Persian for recent dates
 */
export function formatRelativeTime(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return formatJalaliFull(date);
  if (diffDays === 0) return "امروز";
  if (diffDays === 1) return "دیروز";
  if (diffDays === 2) return "پریروز";
  if (diffDays < 7) return `${diffDays} روز پیش`;
  if (diffDays < 14) return "هفته گذشته";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
  if (diffDays < 60) return "ماه گذشته";
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`;
  return formatJalaliFull(date);
}

/**
 * Check if two dates are in the same Jalali month/year
 */
export function isSameJalaliMonth(date1: Date | string, date2: Date | string): boolean {
  const j1 = toJalaliDate(date1);
  const j2 = toJalaliDate(date2);
  return j1.jy === j2.jy && j1.jm === j2.jm;
}

/**
 * Convert Jalali date components to ISO string
 */
export function jalaliToISO(jy: number, jm: number, jd: number): string {
  const gregorian = toGregorian(jy, jm, jd);
  return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
    .toISOString()
    .split("T")[0];
}

/**
 * Get today's Jalali date
 */
export function getTodayJalali(): { jy: number; jm: number; jd: number } {
  const now = new Date();
  return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Format backup filename with Jalali date: "morabi-backup-1405-03-30.json"
 */
export function formatBackupFilename(): string {
  const { jy, jm, jd } = getTodayJalali();
  return `morabi-backup-${jy}-${jm.toString().padStart(2, "0")}-${jd.toString().padStart(2, "0")}.json`;
}
