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
import PersianCalendar from "./PersianCalendar";

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
      <aside className="hidden md:flex w-72 bg-white dark:bg-dark-800 border-l border-gray-200 dark:border-dark-700 flex-col justify-between shadow-sm z-20 transition-colors duration-300">
        <div>
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-200 dark:shadow-none transform hover:scale-105 transition-transform cursor-default">
              MP
            </div>
            <div>
              <div className="font-black text-2xl text-gray-800 dark:text-white tracking-tight">
                MetalPlans
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-40 font-bold bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md w-fit mt-1">
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
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                  currentView === item.id
                    ? "bg-primary-600 text-white font-bold shadow-lg shadow-primary-200 dark:shadow-none"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white font-medium"
                }`}
              >
                <item.icon
                  size={22}
                  className={
                    currentView === item.id
                      ? "text-white"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white"
                  }
                />
                {item.label}
                {currentView === item.id && (
                  <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-5">
          <PersianCalendar />
        </div>
      </aside>
    );
  }
);

export default Sidebar;
