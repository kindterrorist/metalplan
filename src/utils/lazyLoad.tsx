import { lazy } from "react";

// Create lazy-loaded views directly with proper React.lazy format
export const LazyDashboardView = lazy(() => import("../../views/DashboardView").then(m => ({ default: m.DashboardView })));

export const LazyAthletesView = lazy(() => import("../../views/AthletesView").then(m => ({ default: m.AthletesView })));

export const LazyAthleteDetailView = lazy(() => import("../../views/AthleteDetailView").then(m => ({ default: m.AthleteDetailView })));

export const LazyExercisesView = lazy(() => import("../../views/ExercisesView").then(m => ({ default: m.ExercisesView })));

export const LazyToolsView = lazy(() => import("../../views/ToolsView").then(m => ({ default: m.ToolsView })));

export const LazySettingsView = lazy(() => import("../../views/SettingsView").then(m => ({ default: m.SettingsView })));

export const LazyFoodLibraryView = lazy(() => import("../../views/FoodLibraryView").then(m => ({ default: m.FoodLibraryView })));

export const LazyPlanBuilderView = lazy(() => import("../../components/PlanBuilder").then(m => ({ default: m.PlanBuilder })));

export const LazyNutritionBuilderView = lazy(() => import("../../components/NutritionBuilder").then(m => ({ default: m.NutritionBuilder })));
