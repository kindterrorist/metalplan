import React, { useState, Suspense } from "react";
import { View } from "../types";
import { useAppContext } from "./contexts/AppContext";
import { ToastContainer } from "../components/UI";
import { ConfirmDialog } from "../components/UI";
import { COLOR_PALETTES } from "../utils/helpers";
import { compressImage } from "../utils/helpers";
import AppLayout from "./components/layout/AppLayout";
import AthleteModal from "./components/shared/AthleteModal";
import {
  LazyDashboardView,
  LazyAthletesView,
  LazyAthleteDetailView,
  LazyExercisesView,
  LazyToolsView,
  LazySettingsView,
  LazyFoodLibraryView,
  LazyPlanBuilderView,
  LazyNutritionBuilderView,
} from "./utils/lazyLoad.tsx";
import { Athlete, WorkoutPlan, NutritionPlan, TrainerProfile } from "../types";
import ExportModal from "./components/shared/ExportModal";
import { Skeleton } from "../components/UI";

const AppContent: React.FC = () => {
  const {
    // App Data
    athletes,
    plans,
    nutritionPlans,
    trainerProfile,
    exercises,
    isLoading,
    // App Actions
    refreshData,
    saveAthlete,
    savePlan,
    saveNutritionPlan,
    deleteAthlete,
    deletePlan,
    deleteNutritionPlan,
    saveTrainerProfile,
    addToast,
    showConfirm,
    // UI State
    toasts,
    confirmState,
    isAthleteModalOpen,
    isExportModalOpen,
    isMeasurementModalOpen,
    viewingPhoto,
    selectedAthleteId,
    editingAthleteId,
    chartMetric,
    searchTerm,
    apiKey,
    // UI Actions
    removeToast,
    hideConfirm,
    setIsAthleteModalOpen,
    setIsExportModalOpen,
    setIsMeasurementModalOpen,
    setViewingPhoto,
    setSelectedAthleteId,
    setEditingAthleteId,
    setChartMetric,
    setSearchTerm,
    setApiKey,
    // Theme State
    isDarkMode,
    appColor,
    isBoldTheme,
    // Theme Actions
    toggleDarkMode,
    setAppColor,
    toggleBoldTheme,
  } = useAppContext();

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [planToExport, setPlanToExport] = useState<WorkoutPlan | null>(null);
  const [dietToExport, setDietToExport] = useState<NutritionPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [progressToExport, setProgressToExport] = useState<Athlete | null>(
    null
  );
  const [exportConfig, setExportConfig] = useState({
    theme: "modern",
    primaryColor: "#2563eb",
    showTrainerInfo: true,
    showSlogan: true,
    showSignature: true,
    showQuote: false,
    backgroundPattern: "dots",
    includePhotos: false,
    photoAngles: ["front", "side", "back"] as ("front" | "side" | "back")[],
    photoSelectionMode: "first_last" as "first_last" | "latest" | "all",
  });
  const [isExporting, setIsExporting] = useState(false);

  // Find selected athlete
  const selectedAthlete =
    athletes.find((a) => a.id === selectedAthleteId) || null;
  const editingAthlete =
    athletes.find((a) => a.id === editingAthleteId) || null;

  // Check if we're in builder mode
  const isInBuilderMode =
    currentView === "plan-builder" || currentView === "nutrition-builder";

  if (isInBuilderMode && selectedAthlete) {
    // For builder views, we would render the builders directly
    // Since they're not lazy-loaded in the current structure, we'll handle them separately
    return (
      <div
        className={`h-screen w-screen bg-white dark:bg-dark-900 ${
          isDarkMode ? "dark" : ""
        }`}
        dir="rtl"
      >
        {currentView === "plan-builder" ? (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazyPlanBuilderView
              athlete={selectedAthlete}
              onSave={async (plan) => {
                await savePlan(plan);
                refreshData();
                addToast("برنامه با موفقیت ذخیره شد");
                setEditingPlan(null);
                setCurrentView("athletes");
              }}
              onCancel={() => {
                setEditingPlan(null);
                setCurrentView("athletes");
              }}
              initialPlan={editingPlan}
            />
          </Suspense>
        ) : (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazyNutritionBuilderView
              athlete={selectedAthlete}
              onSave={async (plan) => {
                await saveNutritionPlan(plan);
                refreshData();
                addToast("رژیم غذایی با موفقیت ذخیره شد");
                setCurrentView("athletes");
              }}
              onCancel={() => setCurrentView("athletes")}
            />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Toast & Dialog Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={hideConfirm}
        variant={confirmState.variant}
      />

      {/* Main App Layout */}
      <AppLayout
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedAthlete={selectedAthlete}
        setSelectedAthlete={setSelectedAthleteId}
        isDarkMode={isDarkMode}
      >
        {/* Main Content Area */}
        {currentView === "dashboard" && (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazyDashboardView
              athletes={athletes}
              plans={plans}
              exercises={exercises}
              trainerProfile={trainerProfile}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
              setCurrentView={setCurrentView}
              setSelectedAthlete={setSelectedAthleteId}
              setEditingAthlete={setEditingAthleteId}
              setIsAthleteModalOpen={setIsAthleteModalOpen}
            />
          </Suspense>
        )}
        {currentView === "athletes" &&
          (selectedAthlete ? (
            <Suspense fallback={<Skeleton className="w-full h-screen" />}>
              <LazyAthleteDetailView
                selectedAthlete={selectedAthlete}
                plans={plans}
                nutritionPlans={nutritionPlans}
                chartMetric={chartMetric}
                isDarkMode={isDarkMode}
                apiKey={apiKey}
                setChartMetric={setChartMetric}
                setSelectedAthlete={setSelectedAthleteId}
                setEditingAthlete={setEditingAthleteId}
                setIsAthleteModalOpen={setIsAthleteModalOpen}
                setCurrentView={setCurrentView}
                setEditingPlan={setEditingPlan}
                setPlanToExport={setPlanToExport}
                setDietToExport={setDietToExport}
                setProgressToExport={setProgressToExport}
                setIsExportModalOpen={setIsExportModalOpen}
                showConfirm={showConfirm}
                refreshData={refreshData}
                addToast={addToast}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<Skeleton className="w-full h-screen" />}>
              <LazyAthletesView
                athletes={athletes}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setSelectedAthlete={setSelectedAthleteId}
                setEditingAthlete={setEditingAthleteId}
                setIsAthleteModalOpen={setIsAthleteModalOpen}
              />
            </Suspense>
          ))}
        {currentView === "exercises" && (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazyExercisesView
              exercises={exercises}
              showConfirm={showConfirm}
              refreshData={refreshData}
              addToast={addToast}
            />
          </Suspense>
        )}
        {currentView === "tools" && (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazyToolsView
              apiKey={apiKey}
              handleApiKeyChange={(e) => setApiKey(e.target.value)}
              addToast={addToast}
            />
          </Suspense>
        )}
        {currentView === "settings" && (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazySettingsView
              trainerProfile={trainerProfile}
              setTrainerProfile={saveTrainerProfile}
              isDarkMode={isDarkMode}
              setIsDarkMode={toggleDarkMode}
              appColor={appColor}
              setAppColor={setAppColor}
              isBoldTheme={isBoldTheme}
              setIsBoldTheme={toggleBoldTheme}
              COLOR_PALETTES={COLOR_PALETTES}
              compressImage={compressImage}
              showConfirm={showConfirm}
              refreshData={refreshData}
              addToast={addToast}
            />
          </Suspense>
        )}
        {currentView === "food-library" && (
          <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <LazyFoodLibraryView />
          </Suspense>
        )}
      </AppLayout>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        planToExport={planToExport}
        dietToExport={dietToExport}
        progressToExport={progressToExport}
        selectedAthlete={selectedAthlete}
        trainerProfile={trainerProfile}
        exportConfig={exportConfig}
        setExportConfig={setExportConfig}
        isExporting={isExporting}
        setIsExporting={setIsExporting}
      />

      {/* Athlete Modal */}
      <AthleteModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        editingAthlete={editingAthlete}
        onSubmit={async (athlete) => {
          await saveAthlete(athlete);
          setIsAthleteModalOpen(false);
          addToast(
            athlete.id
              ? "ورزشکار با موفقیت ویرایش شد"
              : "ورزشکار جدید با موفقیت ایجاد شد"
          );
        }}
      />
    </>
  );
};

export default AppContent;
