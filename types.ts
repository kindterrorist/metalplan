export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: "Machine" | "Dumbbell" | "Barbell" | "Bodyweight" | "Cable";
  notes?: string;
  videoUrl?: string; // e.g., YouTube/Instagram link
  description?: string; // Form tips or instructions
}

export interface ExerciseSet {
  exerciseId: string;
  exerciseName: string;
  sets: string; // Changed to string to allow ranges like "3-4"
  reps: string; // string to allow "12-15" or "Failure"
  rest?: string;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g., "Shanbeh"
  exercises: ExerciseSet[];
  isRestDay?: boolean;
}

export interface WorkoutPlan {
  id: string;
  athleteId: string;
  name: string;
  startDate: string;
  days: WorkoutDay[];
  notes?: string;
  created_at: number;
}

// --- Nutrition Types ---

export interface FoodItem {
  id: string;
  name: string;
  amount: string; // e.g., "100g", "1 Cup"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLibraryItem {
  id: string;
  name: string;
  category?: string;
  amount: string; // e.g., "100g", "1 Cup"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  brand?: string;
  tags?: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Meal {
  id: string;
  name: string; // e.g., "Breakfast", "Pre-workout"
  foods: FoodItem[];
  time?: string;
}

export interface DietDay {
  id: string;
  dayName: string; // e.g., "Training Day", "Rest Day"
  meals: Meal[];
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

export interface NutritionPlan {
  id: string;
  athleteId: string;
  name: string;
  startDate: string;
  days: DietDay[];
  notes?: string;
  created_at: number;
}

// --- Tracking & Progress Types ---

export interface WorkoutLogEntry {
  id: string;
  date: string;
  planId: string;
  dayId: string;
  completed: boolean;
  notes?: string;
}

export interface NutritionLogEntry {
  id: string;
  date: string;
  planId: string;
  adherence: number; // 0-100%
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  achieved: boolean;
  createdAt: string;
}

// -----------------------

export interface Measurement {
  date: string;
  weight: number;
  bodyFat?: number;
  neck?: number;
  shoulder?: number;
  chest?: number;
  arms?: number;
  forearms?: number;
  waist?: number;
  hips?: number;
  thighs?: number;
  calves?: number;
  photos?: {
    front?: string;
    side?: string;
    back?: string;
  }; // Base64 strings for different angles
  notes?: string; // Coach comments
  mood?: 1 | 2 | 3 | 4 | 5; // Energy/mood level
}

export interface Athlete {
  id: string;
  fullName: string;
  phone?: string;
  age: number;
  height: number;
  gender: "Male" | "Female";
  joinDate: string;
  measurements: Measurement[];
  currentGoal?: string; // e.g., "Bulking", "Cutting"
  status?: "active" | "archived"; // New field
  workoutLog?: WorkoutLogEntry[];
  nutritionLog?: NutritionLogEntry[];
  personalRecords?: PersonalRecord[];
  goals?: Goal[];
}

export interface TrainerProfile {
  name: string;
  clubName?: string;
  slogan?: string; // New: Professional motto
  bio?: string; // New: About the trainer
  certifications?: string[]; // New: List of certifications
  phone?: string;
  instagram?: string;
  telegram?: string; // New
  email?: string; // New
  website?: string; // New
  logoUrl?: string; // Base64 or URL
  signatureUrl?: string; // New: Digital signature image
}

export interface ExportConfig {
  theme: "modern" | "minimal" | "dark" | "bold";
  primaryColor: string;
  showTrainerInfo: boolean;
  showSlogan: boolean;
  showSignature: boolean;
  showQuote: boolean;
  backgroundPattern: "none" | "dots" | "grid" | "waves" | "custom";
  customBackgroundImage?: string;
  includePhotos?: boolean;
  photoAngles?: ("front" | "side" | "back")[];
  photoSelectionMode?: "first_last" | "latest" | "all";
  showPersonalRecords?: boolean;
  showGoals?: boolean;
  showAdherence?: boolean;
  showFullMeasurements?: boolean;
  showCharts?: boolean;
  showDietTargets?: boolean;
  showMealTime?: boolean;
  showExerciseMetadata?: boolean;
  showTrainerBio?: boolean;
}

// Navigation Types
export type View =
  | "dashboard"
  | "athletes"
  | "exercises"
  | "tools"
  | "settings"
  | "plan-builder"
  | "nutrition-builder"
  | "food-library";
