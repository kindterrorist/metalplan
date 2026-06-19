import { Athlete, WorkoutPlan, NutritionPlan, View, PersonalRecord, Goal } from '../../types';

export type TabType = 'overview' | 'analytics' | 'records' | 'plans' | 'history';

export interface AthleteDetailViewProps {
    selectedAthlete: Athlete | null;
    plans: WorkoutPlan[];
    nutritionPlans: NutritionPlan[];
    chartMetric: string;
    isDarkMode: boolean;
    apiKey: string;
    setChartMetric: (metric: string) => void;
    setSelectedAthlete: (athlete: Athlete | null) => void;
    setEditingAthlete: (athleteId: string | null) => void;
    setIsAthleteModalOpen: (open: boolean) => void;
    setCurrentView: (view: View) => void;
    setEditingPlan: (plan: WorkoutPlan | null) => void;
    setPlanToExport: (plan: WorkoutPlan) => void;
    setDietToExport: (plan: NutritionPlan | null) => void;
    setProgressToExport: (athlete: Athlete | null) => void;
    setIsExportModalOpen: (open: boolean) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    refreshData: () => Promise<void>;
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export interface AthleteContextValue {
    athlete: Athlete;
    athletePlans: WorkoutPlan[];
    athleteDiets: NutritionPlan[];
    isDarkMode: boolean;
    apiKey: string;
    updateAthlete: (updates: Partial<Athlete>) => Promise<void>;
    refreshData: () => Promise<void>;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
    setEditingPlan: (plan: WorkoutPlan | null) => void;
    setPlanToExport: (plan: WorkoutPlan) => void;
    setDietToExport: (plan: NutritionPlan | null) => void;
    setProgressToExport: (athlete: Athlete | null) => void;
    setIsExportModalOpen: (open: boolean) => void;
    setCurrentView: (view: View) => void;
    setEditingAthlete: (athleteId: string | null) => void;
    setIsAthleteModalOpen: (open: boolean) => void;
}
