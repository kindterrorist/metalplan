import React, { ReactNode } from "react";
import { View, Athlete } from "../../../types";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedAthlete: Athlete | null;
  setSelectedAthlete: (athlete: Athlete | null) => void;
  isDarkMode: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = React.memo(
  ({
    children,
    currentView,
    setCurrentView,
    selectedAthlete,
    setSelectedAthlete,
    isDarkMode,
  }) => {
    return (
      <div
        className={`flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 font-sans transition-colors duration-300 ${
          isDarkMode ? "dark" : ""
        }`}
        dir="rtl"
      >
        {/* Sidebar - Hidden on mobile */}
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          setSelectedAthlete={setSelectedAthlete}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:bg-gradient-to-br dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 transition-colors duration-300">
          {/* Mobile Header */}
          <MobileHeader
            currentView={currentView}
            setCurrentView={setCurrentView}
          />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          {/* Bottom Navigation (Mobile) */}
          <BottomNav
            currentView={currentView}
            setCurrentView={setCurrentView}
            setSelectedAthlete={setSelectedAthlete}
          />
        </main>
      </div>
    );
  }
);

export default AppLayout;
