import React from "react";
import { View } from "../../../types";
import { LayoutDashboard, Users, Dumbbell, Calculator } from "lucide-react";

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setSelectedAthlete: (athlete: any) => void;
}

const BottomNav: React.FC<BottomNavProps> = React.memo(
  ({ currentView, setCurrentView, setSelectedAthlete }) => {
    const navItems = [
      { id: "dashboard", icon: LayoutDashboard },
      { id: "athletes", icon: Users },
      { id: "exercises", icon: Dumbbell },
      { id: "tools", icon: Calculator },
    ];

    return (
      <div className="md:hidden bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg border-t border-gray-100 dark:border-dark-700 flex justify-around p-3 pb-safe z-30 fixed bottom-0 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id as View);
              setSelectedAthlete(null);
            }}
            className={`p-3 rounded-2xl transition-all ${
              currentView === item.id
                ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-110"
                : "text-gray-400 dark:text-gray-500 active:scale-95"
            }`}
          >
            <item.icon
              size={24}
              strokeWidth={currentView === item.id ? 2.5 : 2}
            />
          </button>
        ))}
      </div>
    );
  }
);

export default BottomNav;
