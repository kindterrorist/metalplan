import React, { ReactNode } from "react";
import { View } from "../../../types";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  selectedAthlete: any;
  setSelectedAthlete: (athlete: any) => void;
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
        className={`flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-dark-900 font-sans ${
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
        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8fafc] dark:bg-dark-90 transition-colors duration-300">
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
