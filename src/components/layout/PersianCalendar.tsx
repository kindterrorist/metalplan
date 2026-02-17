import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PersianCalendarProps {
  className?: string;
}

const PersianCalendar: React.FC<PersianCalendarProps> = ({ className = "" }) => {
  const [currentMonth, setCurrentMonth] = React.useState(0); // 0-11

  // Persian month names
  const persianMonths = [
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

  // Persian day names
  const persianDayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  // Convert Gregorian to Persian date
  const gregorianToPersian = (date: Date) => {
    const jd = Math.floor(
      (date.getTime() / 86400000) +
        (date.getUTCHours() - 12) / 24 +
        2440587.5 +
        0.5
    ) - 0.5;
    const l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    const l2 = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l2 + 1)) / 1461001);
    const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l3) / 2447);
    const d = l3 - Math.floor((2447 * j) / 80);
    const l4 = Math.floor(j / 11);
    const m = j + 2 - 12 * l4;
    const y = 100 * (n - 49) + i + l4;

    let py = y - 621;
    let pm = m;
    let pd = d;

    if (pm > 12) {
      py += 1;
      pm -= 12;
    }

    return { year: py, month: pm, day: pd };
  };

  // Get current Persian date
  const today = useMemo(() => gregorianToPersian(new Date()), []);

  // Get the first day of the selected Persian month
  const getFirstDayOfMonth = (year: number, month: number) => {
    // Convert Persian date to Gregorian
    let py = year;
    let pm = month;

    if (pm <= 6) {
      py += 621;
      pm += 9;
    } else {
      py += 622;
      pm -= 3;
    }

    const firstDay = new Date(py, pm - 1, 1);
    return firstDay.getDay();
  };

  // Get days in Persian month (first 6 months have 31 days, next 5 have 30, last has 29/30)
  const getDaysInMonth = (year: number, month: number) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Month 12 (Esfand) - leap year check
    return isLeapYear(year) ? 30 : 29;
  };

  // Check if Persian year is leap
  const isLeapYear = (year: number) => {
    const breaks = [
      -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
      2192, 2262, 2324, 2394, 2456, 3178,
    ];
    let gy = year + 1600;
    let leap = -14;
    let jp = breaks[0];

    for (let j = 1; j < breaks.length; j += 1) {
      const jm = breaks[j];
      leap += Math.floor((jm - jp) / 33) * 8 + Math.floor(((jm - jp) % 33) / 4);
      if (year < jm) {
        break;
      }
      jp = jm;
    }
    let n = year - 1600;
    let leapadj = Math.floor(n / 33) * 8 + Math.floor(((n % 33) + 3) / 4);
    if (gy < 1583) {
      leapadj = 0;
    }

    return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? leap + leapadj + 1 : leap + leapadj;
  };

  const selectedYear = today.year;
  const selectedMonth = today.month + currentMonth;

  let displayYear = selectedYear;
  let displayMonth = selectedMonth;

  if (displayMonth > 12) {
    displayMonth -= 12;
    displayYear += 1;
  } else if (displayMonth < 1) {
    displayMonth += 12;
    displayYear -= 1;
  }

  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handlePrevMonth = () => setCurrentMonth(currentMonth - 1);
  const handleNextMonth = () => setCurrentMonth(currentMonth + 1);

  return (
    <div
      className={`bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden group cursor-default ${className}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="ماه قبل"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm text-blue-100 font-medium">
            {persianMonths[displayMonth - 1]} {displayYear}
          </p>
        </div>
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="ماه بعد"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-bold text-blue-100">
        {persianDayNames.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 relative z-10">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={`
              aspect-square flex items-center justify-center rounded-lg text-sm font-semibold
              transition-all duration-200
              ${
                day === today.day && displayMonth === today.month && displayYear === today.year
                  ? "bg-white text-blue-600 shadow-lg scale-105"
                  : "text-blue-50 hover:bg-white/20"
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Footer with today's info */}
      <div className="mt-4 pt-4 border-t border-white/20 text-center text-xs text-blue-100 relative z-10">
        <p className="font-medium">
          {today.day} {persianMonths[today.month - 1]} {today.year}
        </p>
      </div>
    </div>
  );
};

export default PersianCalendar;
