import { useState, useEffect, useCallback } from "react";
import {
  Athlete,
  WorkoutPlan,
  TrainerProfile,
  Exercise,
  NutritionPlan,
} from "../../types";
import {
  getAthletes,
  saveAthlete,
  getPlans,
  savePlan,
  getExercises,
  deleteAthlete,
  deletePlan,
  getTrainerProfile,
  saveTrainerProfile,
  getNutritionPlans,
  saveNutritionPlan,
  deleteNutritionPlan,
} from "../../services/electronDb";

export interface AppDataState {
  athletes: Athlete[];
  plans: WorkoutPlan[];
  nutritionPlans: NutritionPlan[];
  trainerProfile: TrainerProfile | null;
  exercises: Exercise[];
  isLoading: boolean;
}

export interface AppDataActions {
  refreshData: () => Promise<void>;
  addToast: (
    title: string,
    message?: string,
    type?: "success" | "error" | "info"
  ) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: "danger" | "primary"
  ) => void;
  saveAthlete: (athlete: Athlete) => Promise<void>;
  savePlan: (plan: WorkoutPlan) => Promise<void>;
  saveNutritionPlan: (plan: NutritionPlan) => Promise<void>;
  deleteAthlete: (id: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  deleteNutritionPlan: (id: string) => Promise<void>;
  saveTrainerProfile: (profile: TrainerProfile) => Promise<void>;
}

export const useAppData = (): [AppDataState, AppDataActions] => {
  const [data, setData] = useState<AppDataState>({
    athletes: [],
    plans: [],
    nutritionPlans: [],
    trainerProfile: null,
    exercises: [],
    isLoading: true,
  });

  const refreshData = useCallback(async () => {
    try {
      const [athletes, plans, exercises, trainerProfile, nutritionPlans] =
        await Promise.all([
          getAthletes(),
          getPlans(),
          getExercises(),
          getTrainerProfile(),
          getNutritionPlans(),
        ]);

      setData((prev) => ({
        ...prev,
        athletes,
        plans,
        exercises,
        trainerProfile,
        nutritionPlans,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error refreshing data:", error);
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Toast and confirm functions would need to be passed from context or props
  // For now, we'll define them as no-ops or you can integrate with your actual toast/confirm system
  const addToast = useCallback(
    (title: string, message?: string, type?: "success" | "error" | "info") => {
      // Implementation would depend on your toast system
      console.log(`${type}: ${title}`, message);
    },
    []
  );

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant?: "danger" | "primary"
    ) => {
      // Implementation would depend on your confirm system
      if (window.confirm(`${title}: ${message}`)) {
        onConfirm();
      }
    },
    []
  );

  const handleSaveAthlete = useCallback(
    async (athlete: Athlete) => {
      await saveAthlete(athlete);
      await refreshData();
    },
    [refreshData]
  );

  const handleSavePlan = useCallback(
    async (plan: WorkoutPlan) => {
      await savePlan(plan);
      await refreshData();
    },
    [refreshData]
  );

  const handleSaveNutritionPlan = useCallback(
    async (plan: NutritionPlan) => {
      await saveNutritionPlan(plan);
      await refreshData();
    },
    [refreshData]
  );

  const handleDeleteAthlete = useCallback(
    async (id: string) => {
      await deleteAthlete(id);
      await refreshData();
    },
    [refreshData]
  );

  const handleDeletePlan = useCallback(
    async (id: string) => {
      await deletePlan(id);
      await refreshData();
    },
    [refreshData]
  );

  const handleDeleteNutritionPlan = useCallback(
    async (id: string) => {
      await deleteNutritionPlan(id);
      await refreshData();
    },
    [refreshData]
  );

  const handleSaveTrainerProfile = useCallback(
    async (profile: TrainerProfile) => {
      await saveTrainerProfile(profile);
      await refreshData();
    },
    [refreshData]
  );

  const actions: AppDataActions = {
    refreshData,
    addToast,
    showConfirm,
    saveAthlete: handleSaveAthlete,
    savePlan: handleSavePlan,
    saveNutritionPlan: handleSaveNutritionPlan,
    deleteAthlete: handleDeleteAthlete,
    deletePlan: handleDeletePlan,
    deleteNutritionPlan: handleDeleteNutritionPlan,
    saveTrainerProfile: handleSaveTrainerProfile,
  };

  return [data, actions];
};
