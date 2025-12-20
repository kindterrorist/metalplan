import React, { lazy, Suspense } from "react";
import { Skeleton } from "../../components/UI";

// Create lazy-loaded views directly with proper React.lazy format
export const LazyDashboardView = React.memo(
  lazy(() => import("../../views/DashboardView").then(m => ({ default: m.DashboardView })))
);

export const LazyAthletesView = React.memo(
  lazy(() => import("../../views/AthletesView").then(m => ({ default: m.AthletesView })))
);

export const LazyAthleteDetailView = React.memo(
  lazy(() => import("../../views/AthleteDetailView").then(m => ({ default: m.AthleteDetailView })))
);

export const LazyExercisesView = React.memo(
  lazy(() => import("../../views/ExercisesView").then(m => ({ default: m.ExercisesView })))
);

export const LazyToolsView = React.memo(
  lazy(() => import("../../views/ToolsView").then(m => ({ default: m.ToolsView })))
);

export const LazySettingsView = React.memo(
  lazy(() => import("../../views/SettingsView").then(m => ({ default: m.SettingsView })))
);

export const LazyPlanBuilderView = React.memo(
  lazy(() => import("../../components/PlanBuilder").then(m => ({ default: m.PlanBuilder })))
);

export const LazyNutritionBuilderView = React.memo(
  lazy(() => import("../../components/NutritionBuilder").then(m => ({ default: m.NutritionBuilder })))
);

// Wrapper component that adds Suspense
export const LazyViewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Suspense fallback={<Skeleton className="w-full h-screen" />}>{children}</Suspense>;
};
