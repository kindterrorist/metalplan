// TypeScript service wrapper for Electron IPC
import {
  Athlete,
  Exercise,
  WorkoutPlan,
  TrainerProfile,
  NutritionPlan,
  FoodLibraryItem,
} from "../types";

// Declare electron API (from preload)
declare global {
  interface Window {
    electron: {
      // Athletes
      getAthletes: () => Promise<Athlete[]>;
      saveAthlete: (athlete: Athlete) => Promise<Athlete>;
      deleteAthlete: (id: string) => Promise<void>;

      // Exercises
      getExercises: () => Promise<Exercise[]>;
      saveExercise: (exercise: Exercise) => Promise<Exercise>;
      deleteExercise: (id: string) => Promise<void>;

      // Plans
      getPlans: () => Promise<WorkoutPlan[]>;
      savePlan: (plan: WorkoutPlan) => Promise<WorkoutPlan>;
      deletePlan: (id: string) => Promise<void>;

      // Nutrition Plans
      getNutritionPlans: () => Promise<NutritionPlan[]>;
      saveNutritionPlan: (plan: NutritionPlan) => Promise<NutritionPlan>;
      deleteNutritionPlan: (id: string) => Promise<void>;

      // Food Library
      getFoodLibraryItems: () => Promise<FoodLibraryItem[]>;
      saveFoodLibraryItem: (item: FoodLibraryItem) => Promise<FoodLibraryItem>;
      deleteFoodLibraryItem: (id: string) => Promise<void>;
      searchFoodLibrary: (query: string) => Promise<FoodLibraryItem[]>;

      // Trainer Profile
      getTrainerProfile: () => Promise<TrainerProfile | null>;
      saveTrainerProfile: (profile: TrainerProfile) => Promise<TrainerProfile>;

      // Reset Functions
      resetAthletes: () => Promise<void>;
      resetPlans: () => Promise<void>;
      resetAll: () => Promise<void>;

      // Backup Management
      getBackupConfig: () => Promise<any>;
      updateBackupConfig: (config: any) => Promise<boolean>;
      createBackup: () => Promise<string>;
      restoreBackup: (backupPath: string) => Promise<boolean>;
      getBackupHistory: () => Promise<any[]>;
      verifyBackup: (backupPath: string) => Promise<boolean>;
    };
  }
}

// Check if running in Electron
const isElectron = () => {
  return window.electron !== undefined;
};

// Mock Database for Browser Development
const MockDB = {
  getItem: <T>(key: string): T[] => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  },
  setItem: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  saveItem: <T extends { id: string }>(key: string, item: T): Promise<T> => {
    const items = MockDB.getItem<T>(key);
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    MockDB.setItem(key, items);
    return Promise.resolve(item);
  },
  deleteItem: <T extends { id: string }>(
    key: string,
    id: string
  ): Promise<void> => {
    const items = MockDB.getItem<T>(key);
    const filtered = items.filter((i) => i.id !== id);
    MockDB.setItem(key, filtered);
    return Promise.resolve();
  },
};

// Athletes
export const getAthletes = async (): Promise<Athlete[]> => {
  if (isElectron()) return window.electron.getAthletes();
  return Promise.resolve(MockDB.getItem<Athlete>("athletes"));
};

export const saveAthlete = async (athlete: Athlete): Promise<Athlete> => {
  if (isElectron()) return window.electron.saveAthlete(athlete);
  return MockDB.saveItem("athletes", athlete);
};

export const deleteAthlete = async (id: string): Promise<void> => {
  if (isElectron()) return window.electron.deleteAthlete(id);
  return MockDB.deleteItem("athletes", id);
};

// Exercises
export const getExercises = async (): Promise<Exercise[]> => {
  if (isElectron()) return window.electron.getExercises();
  return Promise.resolve(MockDB.getItem<Exercise>("exercises"));
};

export const saveExercise = async (exercise: Exercise): Promise<Exercise> => {
  if (isElectron()) return window.electron.saveExercise(exercise);
  return MockDB.saveItem("exercises", exercise);
};

export const deleteExercise = async (id: string): Promise<void> => {
  if (isElectron()) return window.electron.deleteExercise(id);
  return MockDB.deleteItem("exercises", id);
};

// Plans
export const getPlans = async (): Promise<WorkoutPlan[]> => {
  if (isElectron()) return window.electron.getPlans();
  return Promise.resolve(MockDB.getItem<WorkoutPlan>("plans"));
};

export const savePlan = async (plan: WorkoutPlan): Promise<WorkoutPlan> => {
  if (isElectron()) return window.electron.savePlan(plan);
  return MockDB.saveItem("plans", plan);
};

export const deletePlan = async (id: string): Promise<void> => {
  if (isElectron()) return window.electron.deletePlan(id);
  return MockDB.deleteItem("plans", id);
};

// Nutrition Plans
export const getNutritionPlans = async (): Promise<NutritionPlan[]> => {
  if (isElectron()) return window.electron.getNutritionPlans();
  return Promise.resolve(MockDB.getItem<NutritionPlan>("nutritionPlans"));
};

export const saveNutritionPlan = async (
  plan: NutritionPlan
): Promise<NutritionPlan> => {
  if (isElectron()) return window.electron.saveNutritionPlan(plan);
  return MockDB.saveItem("nutritionPlans", plan);
};

export const deleteNutritionPlan = async (id: string): Promise<void> => {
  if (isElectron()) return window.electron.deleteNutritionPlan(id);
  return MockDB.deleteItem("nutritionPlans", id);
};

// Trainer Profile
export const getTrainerProfile = async (): Promise<TrainerProfile | null> => {
  if (isElectron()) return window.electron.getTrainerProfile();
  const profile = localStorage.getItem("trainerProfile");
  return Promise.resolve(profile ? JSON.parse(profile) : null);
};

export const saveTrainerProfile = async (
  profile: TrainerProfile
): Promise<TrainerProfile> => {
  if (isElectron()) return window.electron.saveTrainerProfile(profile);
  localStorage.setItem("trainerProfile", JSON.stringify(profile));
  return Promise.resolve(profile);
};
// Food Library functions
export const getFoodLibraryItems = async (): Promise<FoodLibraryItem[]> => {
  if (isElectron()) return window.electron.getFoodLibraryItems();
  // For browser development
  return Promise.resolve(MockDB.getItem<FoodLibraryItem>("foodLibrary"));
};

export const saveFoodLibraryItem = async (
  item: FoodLibraryItem
): Promise<FoodLibraryItem> => {
  if (isElectron()) return window.electron.saveFoodLibraryItem(item);
  // For browser development
  MockDB.saveItem("foodLibrary", item);
  return Promise.resolve(item);
};

export const deleteFoodLibraryItem = async (id: string): Promise<void> => {
  if (isElectron()) return window.electron.deleteFoodLibraryItem(id);
  // For browser development
  MockDB.deleteItem("foodLibrary", id);
  return Promise.resolve();
};

export const searchFoodLibrary = async (
  query: string
): Promise<FoodLibraryItem[]> => {
  if (isElectron()) return window.electron.searchFoodLibrary(query);
  // For browser development
  const items = MockDB.getItem<FoodLibraryItem>("foodLibrary");
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(lowerQuery) ||
    (item.category && item.category.toLowerCase().includes(lowerQuery)) ||
    item.notes.toLowerCase().includes(lowerQuery)
  );
};

// Export/Import/Reset functions - These need custom handling
export const exportDatabase = async (): Promise<string> => {
  // For now, get all data and stringify
  const athletes = await getAthletes();
  const plans = await getPlans();
  const exercises = await getExercises();
  const nutrition = await getNutritionPlans();
  const profile = await getTrainerProfile();

  return JSON.stringify({ athletes, exercises, plans, nutrition, profile });
};

export const importDatabase = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString);

    if (data.athletes) {
      await Promise.all(data.athletes.map((a: Athlete) => saveAthlete(a)));
    }
    if (data.exercises) {
      await Promise.all(data.exercises.map((e: Exercise) => saveExercise(e)));
    }
    if (data.plans) {
      await Promise.all(data.plans.map((p: WorkoutPlan) => savePlan(p)));
    }
    if (data.nutrition) {
      await Promise.all(
        data.nutrition.map((p: NutritionPlan) => saveNutritionPlan(p))
      );
    }
    if (data.profile) {
      await saveTrainerProfile(data.profile);
    }

    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const resetDatabaseStore = async (
  storeName: "athletes" | "plans" | "nutrition_plans" | "all"
): Promise<void> => {
  if (isElectron()) {
    switch (storeName) {
      case "athletes":
        await window.electron.resetAthletes();
        break;
      case "plans":
        await window.electron.resetPlans();
        break;
      case "all":
        await window.electron.resetAll();
        break;
      default:
        // For nutrition_plans, we need to handle it as part of plans reset
        // Since nutrition plans are handled by the same resetPlans function
        await window.electron.resetPlans();
        break;
    }
  } else {
    // Mock reset for browser development
    switch (storeName) {
      case "athletes":
        localStorage.removeItem("athletes");
        break;
      case "plans":
        localStorage.removeItem("plans");
        localStorage.removeItem("nutritionPlans");
        break;
      case "all":
        localStorage.removeItem("athletes");
        localStorage.removeItem("plans");
        localStorage.removeItem("exercises");
        localStorage.removeItem("nutritionPlans");
        localStorage.removeItem("trainerProfile");
        break;
      default:
        localStorage.removeItem("nutritionPlans");
        break;
    }
  }
};

// Initialize DB (not needed in Electron, but keep for compatibility)
export const initDB = () => {
  return Promise.resolve();
};

// Backup Management Functions
export const getBackupConfig = async () => {
  if (isElectron()) return window.electron.getBackupConfig();
  // Mock for browser development
  return {
    enabled: true,
    intervalHours: 24,
    maxBackups: 7,
    backupPath: "./backups",
  };
};

export const updateBackupConfig = async (config: any) => {
  if (isElectron()) return window.electron.updateBackupConfig(config);
  // Mock for browser development
  return true;
};

export const createBackup = async (): Promise<string> => {
  if (isElectron()) return window.electron.createBackup();
  // Mock for browser development
  return "./mock-backup.db";
};

export const restoreBackup = async (backupPath: string): Promise<boolean> => {
  if (isElectron()) return window.electron.restoreBackup(backupPath);
  // Mock for browser development
  return true;
};

export const getBackupHistory = async () => {
  if (isElectron()) return window.electron.getBackupHistory();
  // Mock for browser development
  return [];
};

export const verifyBackup = async (backupPath: string): Promise<boolean> => {
  if (isElectron()) return window.electron.verifyBackup(backupPath);
  // Mock for browser development
  return true;
};
