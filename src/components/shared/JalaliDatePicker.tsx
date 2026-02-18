import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toJalaali, toGregorian } from "jalaali-js";

interface JalaliDatePickerProps {
  value: string; // ISO date string
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  required = false,
  placeholder = "انتخاب تاریخ...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  // Parse current date or today
  const now = new Date();
  const currentDate = value ? new Date(value) : now;
  const currentJalali = toJalaali(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );

  // Calculate display month and year
  const displayYear = currentJalali.jy + Math.floor(currentMonth / 12);
  const displayMonth = ((currentJalali.jm - 1 + (currentMonth % 12)) % 12) + 1;

  // Get first day of month
  const getFirstDayOfMonth = (jy: number, jm: number): number => {
    const gregorian = toGregorian(jy, jm, 1);
    const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    return date.getDay();
  };

  // Get days in month
  const getDaysInMonth = (jm: number): number => {
    if (jm <= 6) return 31;
    if (jm < 12) return 30;
    return 29;
  };

  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const daysInMonth = getDaysInMonth(displayMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleDateSelect = (day: number) => {
    const gregorian = toGregorian(displayYear, displayMonth, day);
    const dateString = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
      .toISOString()
      .split("T")[0];
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => setCurrentMonth(currentMonth - 1);
  const handleNextMonth = () => setCurrentMonth(currentMonth + 1);

  const displayValue =
    value && value.length > 0
      ? `${String(currentJalali.jd).padStart(2, "0")}/${String(
          currentJalali.jm
        ).padStart(2, "0")}/${currentJalali.jy}`
      : placeholder;

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-gray-700 dark:text-gray-200 text-right hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {displayValue}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg z-50 p-4 min-w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center font-bold text-gray-900 dark:text-white">
              {jalaliMonths[displayMonth - 1]} {displayYear}
            </div>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            {jalaliDayNames.map((day) => (
              <div key={day} className="text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDateSelect(day)}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-semibold
                  transition-all duration-200 cursor-pointer
                  ${
                    day === currentJalali.jd &&
                    displayMonth === currentJalali.jm &&
                    displayYear === currentJalali.jy
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 px-3 py-2 text-sm font-bold rounded-lg bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            بستن
          </button>
        </div>
      )}

      {/* Overlay to close picker */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default JalaliDatePicker;
