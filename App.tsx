import React from "react";
import { AppProvider } from "./src/contexts/AppContext";
import AppContent from "./src/AppContent";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      setHasError(true);
      setError(event.error);
    };
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  if (hasError) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-6"
      >
        <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            خطای غیرمنتظره
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            برنامه با خطا مواجه شد. لطفاً برنامه را مجدداً راه‌اندازی کنید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold transition-colors"
          >
            تلاش مجدد
          </button>
          {error && (
            <pre className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-left overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
