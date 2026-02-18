import React from "react";
import { View } from "../../../types";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calculator,
  Settings as SettingsIcon,
  Utensils,
} from "lucide-react";
import JalaliCalendar from "./JalaliCalendar";

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setSelectedAthlete: (athlete: any) => void;
}

const Sidebar: React.FC<SidebarProps> = React.memo(
  ({ currentView, setCurrentView, setSelectedAthlete }) => {
    const menuItems = [
      { id: "dashboard", icon: LayoutDashboard, label: "داشبورد" },
      { id: "athletes", icon: Users, label: "ورزشکاران" },
      { id: "exercises", icon: Dumbbell, label: "تمرینات" },
      { id: "food-library", icon: Utensils, label: "کتابخانه غذاها" },
      { id: "tools", icon: Calculator, label: "ابزارها" },
      { id: "settings", icon: SettingsIcon, label: "تنظیمات" },
    ];

    return (
      <aside className="hidden md:flex w-72 bg-white dark:bg-dark-800 border-l border-gray-200 dark:border-dark-700 flex-col justify-between shadow-lg dark:shadow-2xl z-20 transition-colors duration-300">
        <div>
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-300 dark:shadow-none transform hover:scale-110 transition-all duration-300 cursor-default">
              MP
            </div>
            <div>
              <div className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">
                MetalPlans
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg w-fit mt-1 tracking-wide">
                نسخه آزمایشی
              </div>
            </div>
          </div>
          <nav className="px-5 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setSelectedAthlete(null);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group font-bold text-sm ${
                  currentView === item.id
                    ? "bg-gradient-primary text-white shadow-lg shadow-blue-300 dark:shadow-none"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-dark-700 dark:hover:to-dark-600 hover:text-gray-900 dark:hover:text-white translate-x-0 hover:-translate-x-1"
                }`}
              >
                <item.icon
                  size={22}
                  className={
                    currentView === item.id
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
                  }
                />
                <span className="flex-1 text-right">{item.label}</span>
                {currentView === item.id && (
                  <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-5">
          <JalaliCalendar />
        </div>
      </aside>
    );
  }
);

export default Sidebar;
