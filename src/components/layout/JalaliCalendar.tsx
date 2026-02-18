import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toJalaali, toGregorian } from "jalaali-js";

interface JalaliCalendarProps {
  className?: string;
}

const JalaliCalendar: React.FC<JalaliCalendarProps> = ({ className = "" }) => {
  const [currentMonth, setCurrentMonth] = useState(0);

  const jalaliMonths = [
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

  const jalaliDayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  // Get today's Jalali date
  const today = useMemo(() => {
    const now = new Date();
    const jalali = toJalaali(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate()
    );
    return jalali;
  }, []);

  // Get the first day of the selected Jalali month
  const getFirstDayOfMonth = (jy: number, jm: number): number => {
    const gregorian = toGregorian(jy, jm, 1);
    const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    return date.getDay();
  };

  // Get days in Jalali month
  const getDaysInMonth = (jm: number): number => {
    if (jm <= 6) return 31;
    if (jm < 12) return 30;
    return 29; // Esfand
  };

  const displayYear = today.jy + Math.floor(currentMonth / 12);
  const displayMonth = ((today.jm - 1 + (currentMonth % 12)) % 12) + 1;

  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const daysInMonth = getDaysInMonth(displayMonth);
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
            {jalaliMonths[displayMonth - 1]} {displayYear}
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
        {jalaliDayNames.map((day) => (
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
                day === today.jd &&
                displayMonth === today.jm &&
                displayYear === today.jy
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
          {String(today.jd).padStart(2, "0")}/{String(today.jm).padStart(2, "0")}/{today.jy}
        </p>
      </div>
    </div>
  );
};

export default JalaliCalendar;
