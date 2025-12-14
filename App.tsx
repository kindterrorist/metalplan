import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Athlete,
  WorkoutPlan,
  TrainerProfile,
  Measurement,
  Exercise,
  ExportConfig,
  NutritionPlan,
  DietDay,
} from "./types";
import {
  Users,
  Dumbbell,
  Calendar,
  LayoutDashboard,
  Settings as SettingsIcon,
  Calculator,
  Plus,
  Trash,
  Edit,
  RefreshCw,
  Check,
  X,
  Upload,
  FileCode,
  FileImage,
  Share2,
  Layout,
  FileText,
  Moon,
  Shield,
  Ban,
  Circle,
  Grid,
  Waves,
  Image as ImageIcon,
  Phone,
  Award,
  MessageSquare,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Label,
  Modal,
  Select,
  ToastContainer,
  ToastMessage,
  ConfirmDialog,
} from "./components/UI";
import { PlanBuilder } from "./components/PlanBuilder";
import { NutritionBuilder } from "./components/NutritionBuilder";
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
} from "./services/electronDb";
import { compressImage, COLOR_PALETTES } from "./utils/helpers";
import {
  downloadPlanAsHtml,
  downloadDietAsHtml,
  downloadProgressAsHtml,
  downloadPlanAsImage,
  downloadDietAsImage,
  downloadProgressAsImage,
} from "./services/exportService";
import { DashboardView } from "./views/DashboardView";
import { AthletesView } from "./views/AthletesView";
import { AthleteDetailView } from "./views/AthleteDetailView";
import { ExercisesView } from "./views/ExercisesView";
import { ToolsView } from "./views/ToolsView";
import { SettingsView } from "./views/SettingsView";

function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  // Theme States
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [appColor, setAppColor] = useState(
    localStorage.getItem("appColor") || "blue"
  );
  const [isBoldTheme, setIsBoldTheme] = useState(
    localStorage.getItem("isBoldTheme") === "true"
  );

  // Toggle Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Apply App Color
  useEffect(() => {
    const palette = COLOR_PALETTES[appColor] || COLOR_PALETTES["blue"];
    const root = document.documentElement;

    Object.entries(palette.colors).forEach(([shade, value]) => {
      root.style.setProperty(`--primary-${shade}`, value);
    });

    localStorage.setItem("appColor", appColor);
  }, [appColor]);

  // Apply Bold Theme
  useEffect(() => {
    if (isBoldTheme) {
      document.body.classList.add("theme-bold");
    } else {
      document.body.classList.remove("theme-bold");
    }
    localStorage.setItem("isBoldTheme", String(isBoldTheme));
  }, [isBoldTheme]);

  // Data State
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile | null>(
    null
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [chartMetric, setChartMetric] = useState<string>("weight");
  const [searchTerm, setSearchTerm] = useState("");
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("gemini_api_key") || ""
  );

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (
    title: string,
    message: string = "",
    type: "success" | "error" | "info" = "success"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // Confirm Dialog State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "primary";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: "danger" | "primary" = "danger"
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
      variant,
    });
  };

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [planToExport, setPlanToExport] = useState<WorkoutPlan | null>(null);
  const [dietToExport, setDietToExport] = useState<NutritionPlan | null>(null);
  const [progressToExport, setProgressToExport] = useState<Athlete | null>(
    null
  ); // New state for progress export
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    theme: "modern",
    primaryColor: "#2563eb",
    showTrainerInfo: true,
    showSlogan: true,
    showSignature: true,
    showQuote: false,
    backgroundPattern: "dots",
  });
  const [isExporting, setIsExporting] = useState(false);

  // Photo Viewer State
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Fetch Data
  const refreshData = async () => {
    const [a, p, e, tp, np] = await Promise.all([
      getAthletes(),
      getPlans(),
      getExercises(),
      getTrainerProfile(),
      getNutritionPlans(),
    ]);
    setAthletes(a);
    setPlans(p);
    setExercises(e);
    setTrainerProfile(tp);
    setNutritionPlans(np);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  if (currentView === "plan-builder" && selectedAthlete) {
    return (
      <div
        className={`h-screen w-screen bg-white dark:bg-dark-900 ${
          isDarkMode ? "dark" : ""
        }`}
        dir="rtl"
      >
        <PlanBuilder
          athlete={selectedAthlete}
          onSave={async (plan) => {
            await savePlan(plan);
            refreshData();
            addToast("برنامه با موفقیت ذخیره شد");
            setCurrentView("athletes");
          }}
          onCancel={() => setCurrentView("athletes")}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  if (currentView === "nutrition-builder" && selectedAthlete) {
    return (
      <div
        className={`h-screen w-screen bg-white dark:bg-dark-900 ${
          isDarkMode ? "dark" : ""
        }`}
        dir="rtl"
      >
        <NutritionBuilder
          athlete={selectedAthlete}
          onSave={async (plan) => {
            await saveNutritionPlan(plan);
            refreshData();
            addToast("رژیم غذایی با موفقیت ذخیره شد");
            setCurrentView("athletes");
          }}
          onCancel={() => setCurrentView("athletes")}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-dark-900 font-sans ${
        isDarkMode ? "dark" : ""
      }`}
      dir="rtl"
    >
      {/* Toast & Dialog Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        variant={confirmState.variant}
      />

      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-dark-800 border-l border-gray-200 dark:border-dark-700 flex-col justify-between shadow-sm z-20 transition-colors duration-300">
        <div>
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-200 dark:shadow-none transform hover:scale-105 transition-transform cursor-default">
              M
            </div>
            <div>
              <div className="font-black text-2xl text-gray-800 dark:text-white tracking-tight">
                مربی پرو
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md w-fit mt-1">
                نسخه ۱.۱
              </div>
            </div>
          </div>
          <nav className="px-5 space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "داشبورد" },
              { id: "athletes", icon: Users, label: "ورزشکاران" },
              { id: "exercises", icon: Dumbbell, label: "تمرینات" },
              { id: "tools", icon: Calculator, label: "ابزارها" },
              { id: "settings", icon: SettingsIcon, label: "تنظیمات" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setSelectedAthlete(null);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
                  currentView === item.id
                    ? "bg-primary-600 text-white font-bold shadow-lg shadow-primary-200 dark:shadow-none"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white font-medium"
                }`}
              >
                <item.icon
                  size={22}
                  className={
                    currentView === item.id
                      ? "text-white"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-white"
                  }
                />
                {item.label}
                {currentView === item.id && (
                  <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-5">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-dark-700 dark:to-dark-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group cursor-default">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition-all"></div>
            <p className="text-xs text-gray-400 mb-2 font-medium">
              وضعیت اشتراک
            </p>
            <p className="font-black text-lg mb-1">نسخه حرفه‌ای</p>
            <p className="text-xs text-gray-400">نامحدود و رایگان</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8fafc] dark:bg-dark-900 transition-colors duration-300">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-100 dark:border-dark-700 z-20 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              M
            </div>
            <div className="font-black text-lg text-gray-900 dark:text-white">
              مربی پرو
            </div>
          </div>
          <button
            onClick={() => setCurrentView("settings")}
            className="p-2 bg-gray-50 dark:bg-dark-700 rounded-xl"
          >
            <SettingsIcon
              size={20}
              className="text-gray-600 dark:text-gray-300"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {currentView === "dashboard" && (
              <DashboardView
                athletes={athletes}
                plans={plans}
                exercises={exercises}
                trainerProfile={trainerProfile}
                isLoading={isLoading}
                isDarkMode={isDarkMode}
                setCurrentView={setCurrentView}
                setSelectedAthlete={setSelectedAthlete}
                setEditingAthlete={setEditingAthlete}
                setIsAthleteModalOpen={setIsAthleteModalOpen}
              />
            )}
            {currentView === "athletes" &&
              (selectedAthlete ? (
                <AthleteDetailView
                  selectedAthlete={selectedAthlete}
                  plans={plans}
                  nutritionPlans={nutritionPlans}
                  chartMetric={chartMetric}
                  isDarkMode={isDarkMode}
                  apiKey={apiKey}
                  setChartMetric={setChartMetric}
                  setSelectedAthlete={setSelectedAthlete}
                  setEditingAthlete={setEditingAthlete}
                  setIsAthleteModalOpen={setIsAthleteModalOpen}
                  setCurrentView={setCurrentView}
                  setPlanToExport={setPlanToExport}
                  setDietToExport={setDietToExport}
                  setProgressToExport={setProgressToExport} // Pass prop
                  setIsExportModalOpen={setIsExportModalOpen}
                  showConfirm={showConfirm}
                  refreshData={refreshData}
                  addToast={addToast}
                />
              ) : (
                <AthletesView
                  athletes={athletes}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setSelectedAthlete={setSelectedAthlete}
                  setEditingAthlete={setEditingAthlete}
                  setIsAthleteModalOpen={setIsAthleteModalOpen}
                />
              ))}
            {currentView === "exercises" && (
              <ExercisesView
                exercises={exercises}
                showConfirm={showConfirm}
                refreshData={refreshData}
                addToast={addToast}
              />
            )}
            {currentView === "tools" && (
              <ToolsView
                apiKey={apiKey}
                handleApiKeyChange={handleApiKeyChange}
                addToast={addToast}
              />
            )}
            {currentView === "settings" && (
              <SettingsView
                trainerProfile={trainerProfile}
                setTrainerProfile={setTrainerProfile}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                appColor={appColor}
                setAppColor={setAppColor}
                isBoldTheme={isBoldTheme}
                setIsBoldTheme={setIsBoldTheme}
                COLOR_PALETTES={COLOR_PALETTES}
                compressImage={compressImage}
                showConfirm={showConfirm}
                refreshData={refreshData}
                addToast={addToast}
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation (Mobile) */}
        <div className="md:hidden bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg border-t border-gray-100 dark:border-dark-700 flex justify-around p-3 pb-safe z-30 fixed bottom-0 w-full shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
          {[
            { id: "dashboard", icon: LayoutDashboard },
            { id: "athletes", icon: Users },
            { id: "exercises", icon: Dumbbell },
            { id: "tools", icon: Calculator },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setSelectedAthlete(null);
              }}
              className={`p-3 rounded-2xl transition-all ${
                currentView === item.id
                  ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 scale-110"
                  : "text-gray-400 dark:text-gray-500 active:scale-95"
              }`}
            >
              <item.icon
                size={24}
                strokeWidth={currentView === item.id ? 2.5 : 2}
              />
            </button>
          ))}
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={isAthleteModalOpen}
        onClose={() => {
          setIsAthleteModalOpen(false);
          setEditingAthlete(null);
        }}
        title={editingAthlete ? "ویرایش ورزشکار" : "افزودن ورزشکار"}
      >
        <form
          key={editingAthlete ? editingAthlete.id : "new"}
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const data = new FormData(form);

            const weightVal = parseFloat(data.get("weight") as string);
            let measurements = editingAthlete
              ? [...editingAthlete.measurements]
              : [];
            if (measurements.length === 0) {
              measurements.push({
                date: new Date().toISOString(),
                weight: weightVal,
              });
            } else {
              const last = measurements[measurements.length - 1];
              if (last.weight !== weightVal) {
                measurements.push({
                  date: new Date().toISOString(),
                  weight: weightVal,
                });
              }
            }

            const athleteData: Athlete = {
              id: editingAthlete ? editingAthlete.id : crypto.randomUUID(),
              fullName: data.get("fullName") as string,
              phone: data.get("phone") as string,
              age: parseInt(data.get("age") as string),
              height: parseInt(data.get("height") as string),
              gender: data.get("gender") as "Male" | "Female",
              joinDate: editingAthlete
                ? editingAthlete.joinDate
                : new Date().toISOString(),
              measurements: measurements,
              currentGoal: data.get("goal") as string,
              status: (data.get("status") as any) || "active",
            };
            await saveAthlete(athleteData);
            if (selectedAthlete && selectedAthlete.id === athleteData.id) {
              setSelectedAthlete(athleteData);
            }
            refreshData();
            setIsAthleteModalOpen(false);
            setEditingAthlete(null);
            addToast(
              editingAthlete ? "تغییرات ذخیره شد" : "ورزشکار جدید ثبت شد"
            );
          }}
          className="space-y-4"
        >
          <div>
            <Label>نام کامل</Label>
            <Input
              name="fullName"
              defaultValue={editingAthlete?.fullName}
              required
              className="font-bold"
              autoFocus
            />
          </div>
          <div>
            <Label>شماره تماس</Label>
            <Input
              name="phone"
              defaultValue={editingAthlete?.phone}
              className="font-sans"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>سن</Label>
              <Input
                name="age"
                type="number"
                defaultValue={editingAthlete?.age}
                required
                className="text-center"
              />
            </div>
            <div>
              <Label>قد (cm)</Label>
              <Input
                name="height"
                type="number"
                defaultValue={editingAthlete?.height}
                required
                className="text-center"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>جنسیت</Label>
              <Select
                name="gender"
                defaultValue={editingAthlete?.gender || "Male"}
              >
                <option value="Male">آقا</option>
                <option value="Female">خانم</option>
              </Select>
            </div>
            <div>
              <Label>وزن (kg)</Label>
              <Input
                name="weight"
                type="number"
                step="0.1"
                defaultValue={
                  editingAthlete
                    ? editingAthlete.measurements[
                        editingAthlete.measurements.length - 1
                      ]?.weight
                    : ""
                }
                required
                className="text-center"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>هدف تمرینی</Label>
              <Input
                name="goal"
                defaultValue={editingAthlete?.currentGoal}
                placeholder="مثلا: کاهش وزن"
              />
            </div>
            <div>
              <Label>وضعیت</Label>
              <Select
                name="status"
                defaultValue={editingAthlete?.status || "active"}
              >
                <option value="active">فعال</option>
                <option value="archived">بایگانی شده</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full mt-4 h-12 text-base">
            {editingAthlete ? "ذخیره تغییرات" : "ثبت ورزشکار"}
          </Button>
        </form>
      </Modal>

      {/* Export Configuration Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="تنظیمات خروجی و اشتراک‌گذاری"
      >
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <Label className="mb-3 block text-base">قالب بصری (Theme)</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: "modern",
                  name: "مدرن (پیش‌فرض)",
                  desc: "شیک و امروزی",
                  color: "bg-white border-gray-200",
                },
                {
                  id: "minimal",
                  name: "مینیمال",
                  desc: "ساده و چاپی",
                  color: "bg-gray-50 border-gray-200",
                },
                {
                  id: "dark",
                  name: "دارک مود",
                  desc: "خاص و متفاوت",
                  color: "bg-slate-900 border-slate-700 text-white",
                },
                {
                  id: "bold",
                  name: "آفیشال",
                  desc: "رسمی و اداری",
                  color: "bg-white border-black border-2",
                },
              ].map((theme) => (
                <div
                  key={theme.id}
                  onClick={() =>
                    setExportConfig({ ...exportConfig, theme: theme.id as any })
                  }
                  className={`relative cursor-pointer rounded-2xl p-4 transition-all overflow-hidden group ${
                    exportConfig.theme === theme.id
                      ? "ring-4 ring-primary-500/30 border-primary-500"
                      : "border-transparent hover:ring-2 hover:ring-gray-200 dark:hover:ring-dark-700"
                  } border ${theme.color}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        exportConfig.theme === theme.id
                          ? "bg-primary-500 text-white"
                          : "bg-gray-200 dark:bg-dark-600 text-gray-500"
                      }`}
                    >
                      {exportConfig.theme === theme.id ? (
                        <Check size={16} />
                      ) : (
                        <Layout size={16} />
                      )}
                    </div>
                    {exportConfig.theme === theme.id && (
                      <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                        انتخاب شده
                      </span>
                    )}
                  </div>
                  <h4
                    className={`font-bold ${
                      theme.id === "dark" ? "text-white" : "text-gray-900"
                    } mb-1`}
                  >
                    {theme.name}
                  </h4>
                  <p
                    className={`text-xs ${
                      theme.id === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {theme.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-dark-700">
              <Label className="mb-3 block text-sm">رنگ اصلی برند</Label>
              <div className="flex flex-wrap gap-3">
                {[
                  "#2563eb",
                  "#10b981",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#ec4899",
                  "#111827",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setExportConfig({ ...exportConfig, primaryColor: color })
                    }
                    className={`w-10 h-10 rounded-full shadow-sm transition-all hover:scale-110 flex items-center justify-center ${
                      exportConfig.primaryColor === color
                        ? "ring-4 ring-offset-2 ring-gray-200 dark:ring-dark-600 scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {exportConfig.primaryColor === color && (
                      <Check className="text-white" size={18} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Backgrounds */}
            <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-dark-700">
              <Label className="mb-3 block text-sm">پترن پس‌زمینه</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "none", icon: Ban },
                  { id: "dots", icon: Circle },
                  { id: "grid", icon: Grid },
                  { id: "waves", icon: Waves },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() =>
                      setExportConfig({
                        ...exportConfig,
                        backgroundPattern: pat.id as any,
                      })
                    }
                    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${
                      exportConfig.backgroundPattern === pat.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600"
                        : "border-gray-200 dark:border-dark-600 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700"
                    }`}
                  >
                    <pat.icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options Toggles */}
          <Card className="p-4 border-gray-200 dark:border-dark-700">
            <Label className="mb-3 block">تنظیمات محتوا</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: "showTrainerInfo",
                  label: "اطلاعات تماس مربی",
                  icon: Phone,
                },
                { key: "showSlogan", label: "شعار تبلیغاتی", icon: Award },
                {
                  key: "showSignature",
                  label: "امضای دیجیتال",
                  icon: FileImage,
                },
                {
                  key: "showQuote",
                  label: "جمله انگیزشی",
                  icon: MessageSquare,
                },
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() =>
                    setExportConfig({
                      ...exportConfig,
                      [opt.key]: !exportConfig[opt.key as keyof ExportConfig],
                    })
                  }
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                    exportConfig[opt.key as keyof ExportConfig]
                      ? "bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800"
                      : "bg-white dark:bg-dark-800 border-gray-100 dark:border-dark-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      exportConfig[opt.key as keyof ExportConfig]
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 dark:bg-dark-700 text-gray-400"
                    }`}
                  >
                    <opt.icon size={14} />
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      exportConfig[opt.key as keyof ExportConfig]
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-gray-500"
                    }`}
                  >
                    {opt.label}
                  </span>
                  {exportConfig[opt.key as keyof ExportConfig] && (
                    <Check size={16} className="mr-auto text-primary-500" />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Photo Options - Show ONLY if exporting progress */}
          {progressToExport && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                exportConfig.includePhotos || progressToExport
                  ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
                  : "bg-gray-50 border-transparent"
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includePhotos || !!progressToExport}
                  onChange={(e) =>
                    setExportConfig({
                      ...exportConfig,
                      includePhotos: e.target.checked,
                    })
                  }
                  disabled={!!progressToExport} // Always enabled for progress report
                  className="w-5 h-5 rounded-md text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="font-bold text-gray-900 dark:text-white">
                  ضمیمه کردن تصاویر پیشرفت (جدول تصویری)
                </span>
              </label>

              {(exportConfig.includePhotos || progressToExport) && (
                <div className="mt-4 pr-8 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                  <div>
                    <Label className="text-xs mb-1.5 block">زاویه‌ها</Label>
                    <div className="flex flex-wrap gap-1">
                      {["front", "side", "back"].map((angle) => (
                        <button
                          key={angle}
                          onClick={() => {
                            const current = exportConfig.photoAngles || [];
                            const updated = current.includes(angle as any)
                              ? current.filter((a) => a !== angle)
                              : [...current, angle as any];
                            setExportConfig({
                              ...exportConfig,
                              photoAngles: updated,
                            });
                          }}
                          className={`px-2 py-1 text-xs rounded border ${
                            exportConfig.photoAngles?.includes(angle as any)
                              ? "bg-blue-500 text-white border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {angle === "front"
                            ? "روبرو"
                            : angle === "side"
                            ? "نیم‌رخ"
                            : "پشت"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">نوع نمایش</Label>
                    <select
                      value={exportConfig.photoSelectionMode}
                      onChange={(e) =>
                        setExportConfig({
                          ...exportConfig,
                          photoSelectionMode: e.target.value as any,
                        })
                      }
                      className="w-full text-xs p-1 rounded border border-gray-300 bg-white"
                    >
                      <option value="first_last">اولین و آخرین (مقایسه)</option>
                      <option value="latest">فقط آخرین وضعیت</option>
                      <option value="all">تمام تاریخچه</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-dark-700">
            <Button
              onClick={() => {
                if (planToExport && selectedAthlete) {
                  downloadPlanAsHtml(
                    planToExport,
                    selectedAthlete,
                    trainerProfile,
                    exportConfig
                  );
                  setIsExportModalOpen(false);
                } else if (dietToExport && selectedAthlete) {
                  downloadDietAsHtml(
                    dietToExport,
                    selectedAthlete,
                    trainerProfile,
                    exportConfig
                  );
                  setIsExportModalOpen(false);
                } else if (progressToExport) {
                  downloadProgressAsHtml(
                    progressToExport,
                    trainerProfile,
                    exportConfig
                  );
                  setIsExportModalOpen(false);
                }
              }}
              className="flex-1 h-12 text-base bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black"
            >
              <FileCode size={18} className="ml-2" />
              دانلود فایل HTML
            </Button>
            <Button
              onClick={() => {
                if (planToExport && selectedAthlete) {
                  downloadPlanAsImage(
                    planToExport,
                    selectedAthlete,
                    trainerProfile,
                    exportConfig,
                    () => setIsExporting(true),
                    () => {
                      setIsExporting(false);
                      setIsExportModalOpen(false);
                    }
                  );
                } else if (dietToExport && selectedAthlete) {
                  downloadDietAsImage(
                    dietToExport,
                    selectedAthlete,
                    trainerProfile,
                    exportConfig,
                    () => setIsExporting(true),
                    () => {
                      setIsExporting(false);
                      setIsExportModalOpen(false);
                    }
                  );
                } else if (progressToExport) {
                  downloadProgressAsImage(
                    progressToExport,
                    trainerProfile,
                    exportConfig,
                    () => setIsExporting(true),
                    () => {
                      setIsExporting(false);
                      setIsExportModalOpen(false);
                    }
                  );
                }
              }}
              disabled={isExporting}
              className="flex-1 h-12 text-base"
            >
              {isExporting ? (
                <RefreshCw className="animate-spin ml-2" size={18} />
              ) : (
                <FileImage size={18} className="ml-2" />
              )}
              دانلود تصویر (JPG)
            </Button>
          </div>
          <p className="text-center text-xs text-gray-400">
            فایل HTML برای پرینت و فایل تصویر برای اشتراک در شبکه‌های اجتماعی
            مناسب است.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default App;
