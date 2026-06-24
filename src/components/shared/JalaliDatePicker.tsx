import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { toJalaali, toGregorian } from "jalaali-js";
import {
  JALALI_MONTHS,
  JALALI_DAY_NAMES_SHORT,
  getJalaliMonthLength,
  jalaliToISO,
  getTodayJalali,
  getJalaliDayName,
  formatJalaliFull,
} from "../../utils/jalali";

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
  const [manualInput, setManualInput] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualError, setManualError] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  const today = getTodayJalali();

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

  // BUG-1 FIX: Use jalaaliMonthLength for correct Esfand leap year handling
  const daysInMonth = getJalaliMonthLength(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const handleDateSelect = (day: number) => {
    const dateString = jalaliToISO(displayYear, displayMonth, day);
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => setCurrentMonth(currentMonth - 1);
  const handleNextMonth = () => setCurrentMonth(currentMonth + 1);

  // FEATURE-1: Go to today
  const handleGoToToday = () => {
    setCurrentMonth(0);
  };

  // FEATURE-5: Manual Jalali date input
  const handleManualInput = () => {
    const parts = manualInput.replace(/[\/\-\\]/g, "/").split("/");
    if (parts.length !== 3) {
      setManualError("فرمت صحیح: ۱۴۰۵/۰۳/۳۰");
      return;
    }
    const jy = parseInt(parts[0]);
    const jm = parseInt(parts[1]);
    const jd = parseInt(parts[2]);
    if (isNaN(jy) || isNaN(jm) || isNaN(jd)) {
      setManualError("اعداد صحیح وارد کنید");
      return;
    }
    if (jm < 1 || jm > 12) {
      setManualError("ماه باید بین ۱ تا ۱۲ باشد");
      return;
    }
    const maxDay = getJalaliMonthLength(jy, jm);
    if (jd < 1 || jd > maxDay) {
      setManualError(`روز باید بین ۱ تا ${maxDay} باشد`);
      return;
    }
    const dateString = jalaliToISO(jy, jm, jd);
    onChange(dateString);
    setIsOpen(false);
    setManualInput("");
    setManualError("");
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const displayValue =
    value && value.length > 0
      ? `${String(currentJalali.jd).padStart(2, "0")}/${String(
          currentJalali.jm
        ).padStart(2, "0")}/${currentJalali.jy}`
      : placeholder;

  return (
    <div className="relative w-full" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-gray-700 dark:text-gray-200 text-right hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {displayValue}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-lg z-[60] p-4 min-w-80">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => { setIsManualMode(!isManualMode); setManualError(""); }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {isManualMode ? "انتخاب از تقویم" : "ورود دستی تاریخ"}
            </button>
            {/* FEATURE-1: Go to today button */}
            <button
              type="button"
              onClick={handleGoToToday}
              className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              <CalendarDays size={12} />
              امروز
            </button>
          </div>

          {isManualMode ? (
            /* FEATURE-5: Manual input mode */
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value); setManualError(""); }}
                  placeholder="۱۴۰۵/۰۳/۳۰"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleManualInput(); }}
                />
                {manualError && (
                  <p className="text-xs text-red-500 mt-1">{manualError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleManualInput}
                className="w-full px-3 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                ثبت تاریخ
              </button>
            </div>
          ) : (
            <>
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
                  {JALALI_MONTHS[displayMonth - 1]} {displayYear}
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
                {JALALI_DAY_NAMES_SHORT.map((day) => (
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
                    title={getJalaliDayName(new Date(toGregorian(displayYear, displayMonth, day).gy, toGregorian(displayYear, displayMonth, day).gm - 1, toGregorian(displayYear, displayMonth, day).gd))}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm font-semibold
                      transition-all duration-200 cursor-pointer
                      ${
                        day === currentJalali.jd &&
                        displayMonth === currentJalali.jm &&
                        displayYear === currentJalali.jy
                          ? "bg-blue-600 text-white shadow-lg"
                          : day === today.jd &&
                            displayMonth === today.jm &&
                            displayYear === today.jy
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-700"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
                      }
                    `}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </>
          )}

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
    </div>
  );
};

export default JalaliDatePicker;
