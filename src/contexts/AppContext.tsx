import React, { createContext, useContext, useMemo } from "react";
import { useAppData } from "../hooks/useAppData";
import { useUIState } from "../hooks/useUIState";
import { useTheme } from "../hooks/useTheme";

interface AppContextType {
  // App Data
  athletes: ReturnType<typeof useAppData>[0]["athletes"];
  plans: ReturnType<typeof useAppData>[0]["plans"];
  nutritionPlans: ReturnType<typeof useAppData>[0]["nutritionPlans"];
  trainerProfile: ReturnType<typeof useAppData>[0]["trainerProfile"];
  exercises: ReturnType<typeof useAppData>[0]["exercises"];
  isLoading: ReturnType<typeof useAppData>[0]["isLoading"];
  // App Actions
  refreshData: ReturnType<typeof useAppData>[1]["refreshData"];
  saveAthlete: ReturnType<typeof useAppData>[1]["saveAthlete"];
  savePlan: ReturnType<typeof useAppData>[1]["savePlan"];
  saveNutritionPlan: ReturnType<typeof useAppData>[1]["saveNutritionPlan"];
  deleteAthlete: ReturnType<typeof useAppData>[1]["deleteAthlete"];
  deletePlan: ReturnType<typeof useAppData>[1]["deletePlan"];
  deleteNutritionPlan: ReturnType<typeof useAppData>[1]["deleteNutritionPlan"];
  saveTrainerProfile: ReturnType<typeof useAppData>[1]["saveTrainerProfile"];
  // UI State
  toasts: ReturnType<typeof useUIState>[0]["toasts"];
  confirmState: ReturnType<typeof useUIState>[0]["confirmState"];
  isAthleteModalOpen: ReturnType<typeof useUIState>[0]["isAthleteModalOpen"];
  isExportModalOpen: ReturnType<typeof useUIState>[0]["isExportModalOpen"];
  isMeasurementModalOpen: ReturnType<
    typeof useUIState
  >[0]["isMeasurementModalOpen"];
  viewingPhoto: ReturnType<typeof useUIState>[0]["viewingPhoto"];
  selectedAthleteId: ReturnType<typeof useUIState>[0]["selectedAthleteId"];
  editingAthleteId: ReturnType<typeof useUIState>[0]["editingAthleteId"];
  chartMetric: ReturnType<typeof useUIState>[0]["chartMetric"];
  searchTerm: ReturnType<typeof useUIState>[0]["searchTerm"];
  apiKey: ReturnType<typeof useUIState>[0]["apiKey"];
  // UI Actions
  addToast: ReturnType<typeof useUIState>[1]["addToast"];
  removeToast: ReturnType<typeof useUIState>[1]["removeToast"];
  showConfirm: ReturnType<typeof useUIState>[1]["showConfirm"];
  hideConfirm: ReturnType<typeof useUIState>[1]["hideConfirm"];
  setIsAthleteModalOpen: ReturnType<
    typeof useUIState
  >[1]["setIsAthleteModalOpen"];
  setIsExportModalOpen: ReturnType<
    typeof useUIState
  >[1]["setIsExportModalOpen"];
  setIsMeasurementModalOpen: ReturnType<
    typeof useUIState
  >[1]["setIsMeasurementModalOpen"];
  setViewingPhoto: ReturnType<typeof useUIState>[1]["setViewingPhoto"];
  setSelectedAthleteId: ReturnType<
    typeof useUIState
  >[1]["setSelectedAthleteId"];
  setEditingAthleteId: ReturnType<typeof useUIState>[1]["setEditingAthleteId"];
  setChartMetric: ReturnType<typeof useUIState>[1]["setChartMetric"];
  setSearchTerm: ReturnType<typeof useUIState>[1]["setSearchTerm"];
  setApiKey: ReturnType<typeof useUIState>[1]["setApiKey"];
  // Theme State
  isDarkMode: ReturnType<typeof useTheme>[0]["isDarkMode"];
  appColor: ReturnType<typeof useTheme>[0]["appColor"];
  isBoldTheme: ReturnType<typeof useTheme>[0]["isBoldTheme"];
  // Theme Actions
  toggleDarkMode: ReturnType<typeof useTheme>[1]["toggleDarkMode"];
  setAppColor: ReturnType<typeof useTheme>[1]["setAppColor"];
  toggleBoldTheme: ReturnType<typeof useTheme>[1]["toggleBoldTheme"];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [appData, appActions] = useAppData();
  const [uiState, uiActions] = useUIState();
  const [themeState, themeActions] = useTheme();

  const contextValue = useMemo(
    () => ({
      // App Data
      athletes: appData.athletes,
      plans: appData.plans,
      nutritionPlans: appData.nutritionPlans,
      trainerProfile: appData.trainerProfile,
      exercises: appData.exercises,
      isLoading: appData.isLoading,
      // App Actions
      refreshData: appActions.refreshData,
      saveAthlete: appActions.saveAthlete,
      savePlan: appActions.savePlan,
      saveNutritionPlan: appActions.saveNutritionPlan,
      deleteAthlete: appActions.deleteAthlete,
      deletePlan: appActions.deletePlan,
      deleteNutritionPlan: appActions.deleteNutritionPlan,
      saveTrainerProfile: appActions.saveTrainerProfile,
      // UI State
      toasts: uiState.toasts,
      confirmState: uiState.confirmState,
      isAthleteModalOpen: uiState.isAthleteModalOpen,
      isExportModalOpen: uiState.isExportModalOpen,
      isMeasurementModalOpen: uiState.isMeasurementModalOpen,
      viewingPhoto: uiState.viewingPhoto,
      selectedAthleteId: uiState.selectedAthleteId,
      editingAthleteId: uiState.editingAthleteId,
      chartMetric: uiState.chartMetric,
      searchTerm: uiState.searchTerm,
      apiKey: uiState.apiKey,
      // UI Actions
      addToast: uiActions.addToast,
      removeToast: uiActions.removeToast,
      showConfirm: uiActions.showConfirm,
      hideConfirm: uiActions.hideConfirm,
      setIsAthleteModalOpen: uiActions.setIsAthleteModalOpen,
      setIsExportModalOpen: uiActions.setIsExportModalOpen,
      setIsMeasurementModalOpen: uiActions.setIsMeasurementModalOpen,
      setViewingPhoto: uiActions.setViewingPhoto,
      setSelectedAthleteId: uiActions.setSelectedAthleteId,
      setEditingAthleteId: uiActions.setEditingAthleteId,
      setChartMetric: uiActions.setChartMetric,
      setSearchTerm: uiActions.setSearchTerm,
      setApiKey: uiActions.setApiKey,
      // Theme State
      isDarkMode: themeState.isDarkMode,
      appColor: themeState.appColor,
      isBoldTheme: themeState.isBoldTheme,
      // Theme Actions
      toggleDarkMode: themeActions.toggleDarkMode,
      setAppColor: themeActions.setAppColor,
      toggleBoldTheme: themeActions.toggleBoldTheme,
    }),
    [appData, appActions, uiState, uiActions, themeState, themeActions]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
