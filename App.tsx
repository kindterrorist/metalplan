import React from "react";
import { AppProvider } from "./src/contexts/AppContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { UIProvider } from "./src/contexts/UIContext";
import AppContent from "./src/AppContent";

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UIProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </UIProvider>
    </ThemeProvider>
  );
};

export default App;
