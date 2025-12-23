import React from "react";
import { Settings as SettingsIcon, Utensils } from "lucide-react";
import { View } from "../../../types";

interface MobileHeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = React.memo(
  ({ currentView, setCurrentView }) => {
    return (
      <div className="md:hidden bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-100 dark:border-dark-700 z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <div className="font-black text-lg text-gray-900 dark:text-white">
            مربی پرو
          </div>
        </div>
        <button
          onClick={() => {
            if (currentView === "food-library") {
              setCurrentView("settings");
            } else {
              setCurrentView("food-library");
            }
          }}
          className="p-2 bg-gray-50 dark:bg-dark-700 rounded-xl"
        >
          {currentView === "food-library" ? (
            <SettingsIcon
              size={20}
              className="text-gray-600 dark:text-gray-300"
            />
          ) : (
            <Utensils size={20} className="text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
    );
  }
);

export default MobileHeader;
