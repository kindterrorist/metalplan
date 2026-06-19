import React, { useState, useEffect } from "react";
import {
  WorkoutPlan,
  NutritionPlan,
  Athlete,
  TrainerProfile,
  ExportConfig,
} from "../../../types";
import { Modal, Card, Input, Label, Button, ToggleSwitch, Select } from "../../../components/UI";
import {
  FileCode,
  FileImage,
  RefreshCw,
  Check,
  Layout,
  Ban,
  Circle,
  Grid,
  Waves,
  Phone,
  Award,
  MessageSquare,
  Users,
  Target,
  Activity,
  Ruler,
  BarChart3,
  Scale,
  Clock,
  Info,
  Eye,
  FileSpreadsheet,
  X,
} from "lucide-react";
import {
  downloadPlanAsHtml,
  downloadDietAsHtml,
  downloadProgressAsHtml,
  downloadPlanAsImage,
  downloadDietAsImage,
  downloadProgressAsImage,
  downloadMeasurementsCsv,
  downloadPRsCsv,
  wrapHtml,
} from "../../../services/exportService";
import { getExportStyles, getPlanHtml, getDietHtml, getProgressHtml } from "../../../utils/exportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToExport: WorkoutPlan | null;
  dietToExport: NutritionPlan | null;
  progressToExport: Athlete | null;
  selectedAthlete: Athlete | null;
  trainerProfile: TrainerProfile | null;
  exportConfig: ExportConfig;
  setExportConfig: React.Dispatch<React.SetStateAction<ExportConfig>>;
  isExporting: boolean;
  setIsExporting: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExportModal: React.FC<ExportModalProps> = React.memo(
  ({
    isOpen,
    onClose,
    planToExport,
    dietToExport,
    progressToExport,
    selectedAthlete,
    trainerProfile,
    exportConfig,
    setExportConfig,
    isExporting,
    setIsExporting,
  }) => {
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);

    useEffect(() => {
      if (!previewHtml) return;
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setPreviewHtml(null);
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }, [previewHtml]);

    const handlePreview = () => {
      const styles = getExportStyles(exportConfig);
      let bodyContent = "";
      if (planToExport && selectedAthlete) {
        bodyContent = getPlanHtml(planToExport, selectedAthlete, trainerProfile, exportConfig);
      } else if (dietToExport && selectedAthlete) {
        bodyContent = getDietHtml(dietToExport, selectedAthlete, trainerProfile, exportConfig);
      } else if (progressToExport) {
        bodyContent = getProgressHtml(progressToExport, trainerProfile, exportConfig);
      }
      if (bodyContent) {
        setPreviewHtml(wrapHtml("پیش‌نمایش", bodyContent, styles, false));
      }
    };

    const handleExport = async (format: "html" | "image") => {
      if (planToExport && selectedAthlete) {
        if (format === "html") {
          await downloadPlanAsHtml(
            planToExport,
            selectedAthlete,
            trainerProfile,
            exportConfig
          );
        } else {
          await downloadPlanAsImage(
            planToExport,
            selectedAthlete,
            trainerProfile,
            exportConfig,
            () => setIsExporting(true),
            () => setIsExporting(false)
          );
        }
        onClose();
      } else if (dietToExport && selectedAthlete) {
        if (format === "html") {
          await downloadDietAsHtml(
            dietToExport,
            selectedAthlete,
            trainerProfile,
            exportConfig
          );
        } else {
          await downloadDietAsImage(
            dietToExport,
            selectedAthlete,
            trainerProfile,
            exportConfig,
            () => setIsExporting(true),
            () => setIsExporting(false)
          );
        }
        onClose();
      } else if (progressToExport) {
        if (format === "html") {
          await downloadProgressAsHtml(
            progressToExport,
            trainerProfile,
            exportConfig
          );
        } else {
          await downloadProgressAsImage(
            progressToExport,
            trainerProfile,
            exportConfig,
            () => setIsExporting(true),
            () => setIsExporting(false)
          );
        }
        onClose();
      }
    };

    return (
      <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
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
                  bg: "bg-white",
                  border: "border-gray-200",
                  headerBg: "bg-primary-500",
                  lineColor: "bg-gray-300",
                  darkLine: "bg-gray-600",
                },
                {
                  id: "minimal",
                  name: "مینیمال",
                  desc: "ساده و چاپی",
                  bg: "bg-gray-50",
                  border: "border-gray-200",
                  headerBg: "bg-gray-400",
                  lineColor: "bg-gray-300",
                  darkLine: "bg-gray-500",
                },
                {
                  id: "dark",
                  name: "دارک مود",
                  desc: "خاص و متفاوت",
                  bg: "bg-slate-900",
                  border: "border-slate-700",
                  headerBg: "bg-emerald-500",
                  lineColor: "bg-slate-600",
                  darkLine: "bg-slate-500",
                },
                {
                  id: "bold",
                  name: "آفیشال",
                  desc: "رسمی و اداری",
                  bg: "bg-white",
                  border: "border-black border-2",
                  headerBg: "bg-black",
                  lineColor: "bg-gray-300",
                  darkLine: "bg-gray-600",
                },
              ].map((theme) => (
                <div
                  key={theme.id}
                  onClick={() =>
                    setExportConfig({ ...exportConfig, theme: theme.id as any })
                  }
                  className={`relative cursor-pointer rounded-2xl transition-all overflow-hidden group ${
                    exportConfig.theme === theme.id
                      ? "ring-4 ring-primary-500/30 border-primary-500"
                      : "border-transparent hover:ring-2 hover:ring-gray-200 dark:hover:ring-dark-700"
                  } border ${theme.bg} ${theme.border}`}
                >
                  <div className="p-2">
                    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-dark-700">
                      <div className={`${theme.headerBg} h-2 w-full`} />
                      <div className="p-2 space-y-1.5">
                        <div className={`${theme.lineColor} h-1.5 w-3/4 rounded-full`} />
                        <div className={`${theme.lineColor} h-1.5 w-1/2 rounded-full`} />
                        <div className={`${theme.darkLine} h-1.5 w-2/3 rounded-full opacity-50`} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start px-3 pb-3 pt-1">
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-bold text-sm ${
                          theme.id === "dark" ? "text-white" : "text-gray-900"
                        } mb-0.5 truncate`}
                      >
                        {theme.name}
                      </h4>
                      <p
                        className={`text-xs ${
                          theme.id === "dark" ? "text-gray-400" : "text-gray-500"
                        } truncate`}
                      >
                        {theme.desc}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ms-2 ${
                        exportConfig.theme === theme.id
                          ? "bg-primary-500 text-white"
                          : "bg-gray-200 dark:bg-dark-600 text-gray-500"
                      }`}
                    >
                      {exportConfig.theme === theme.id ? (
                        <Check size={14} />
                      ) : (
                        <Layout size={14} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div className="bg-gray-50 dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-dark-700">
              <Label className="mb-3 block text-sm">رنگ اصلی برند</Label>
              <div className="flex flex-wrap gap-3 items-center">
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
                <div className="relative w-10 h-10">
                  <input
                    type="color"
                    value={exportConfig.primaryColor}
                    onChange={(e) =>
                      setExportConfig({ ...exportConfig, primaryColor: e.target.value })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-dark-600 flex items-center justify-center text-gray-400 hover:border-gray-400 dark:hover:border-dark-500 transition-colors">
                    <span className="text-lg leading-none">+</span>
                  </div>
                </div>
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
                ...(progressToExport
                  ? [
                      { key: "showPersonalRecords", label: "رکوردهای شخصی", icon: Award },
                      { key: "showGoals", label: "اهداف", icon: Target },
                      { key: "showAdherence", label: "آمار پایبندی", icon: Activity },
                      { key: "showFullMeasurements", label: "اندازه‌گیری کامل", icon: Ruler },
                      { key: "showCharts", label: "نمودارها", icon: BarChart3 },
                    ]
                  : []),
                ...(dietToExport
                  ? [
                      { key: "showDietTargets", label: "مقایسه اهداف تغذیه", icon: Scale },
                      { key: "showMealTime", label: "ساعت وعده‌ها", icon: Clock },
                    ]
                  : []),
                ...(planToExport
                  ? [{ key: "showExerciseMetadata", label: "متادیتای تمرین", icon: Info }]
                  : []),
                { key: "showTrainerBio", label: "بیوگرافی مربی", icon: Users },
              ].map((opt) => (
                <ToggleSwitch
                  key={opt.key}
                  checked={!!exportConfig[opt.key as keyof ExportConfig]}
                  onChange={(checked) =>
                    setExportConfig({
                      ...exportConfig,
                      [opt.key]: checked,
                    })
                  }
                  label={opt.label}
                  icon={opt.icon}
                />
              ))}
            </div>
          </Card>

          {/* Photo Options - Show ONLY if exporting progress */}
          {progressToExport && (
            <div
              className={`p-4 rounded-2xl border transition-all ${
                exportConfig.includePhotos
                  ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
                  : "bg-gray-50 border-transparent"
              }`}
            >
              <ToggleSwitch
                checked={exportConfig.includePhotos}
                onChange={(checked) =>
                  setExportConfig({
                    ...exportConfig,
                    includePhotos: checked,
                  })
                }
                label="ضمیمه کردن تصاویر پیشرفت (جدول تصویری)"
              />

              {exportConfig.includePhotos && (
                <div className="mt-4 pe-8 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
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
                    <Select
                      value={exportConfig.photoSelectionMode}
                      onChange={(e) =>
                        setExportConfig({
                          ...exportConfig,
                          photoSelectionMode: e.target.value as any,
                        })
                      }
                    >
                      <option value="first_last">اولین و آخرین (مقایسه)</option>
                      <option value="latest">فقط آخرین وضعیت</option>
                      <option value="all">تمام تاریخچه</option>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-dark-700">
            <Button
              onClick={handlePreview}
              variant="secondary"
              className="h-12"
            >
              <Eye size={18} className="ms-2" />
              پیش‌نمایش
            </Button>
            <Button
              onClick={() => handleExport("html")}
              className="flex-1 h-12 text-base"
            >
              <FileCode size={18} className="ms-2" />
              دانلود HTML
            </Button>
            <Button
              onClick={() => handleExport("image")}
              disabled={isExporting}
              variant="secondary"
              className="flex-1 h-12 text-base"
            >
              {isExporting ? (
                <RefreshCw className="animate-spin ms-2" size={18} />
              ) : (
                <FileImage size={18} className="ms-2" />
              )}
              دانلود تصویر
            </Button>
          </div>

          {/* CSV Buttons */}
          {progressToExport && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => downloadMeasurementsCsv(progressToExport)}
                variant="secondary"
                size="sm"
              >
                <FileSpreadsheet size={14} className="ms-1" /> CSV اندازه‌گیری
              </Button>
              <Button
                onClick={() => downloadPRsCsv(progressToExport)}
                variant="secondary"
                size="sm"
              >
                <FileSpreadsheet size={14} className="ms-1" /> CSV رکوردها
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-gray-500">
            فایل HTML برای پرینت و فایل تصویر برای اشتراک در شبکه‌های اجتماعی
            مناسب است.
          </p>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-modal-overlay" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-[900px] h-[85vh] flex flex-col overflow-hidden animate-modal-content">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-dark-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">پیش‌نمایش خروجی</h3>
              <button
                onClick={() => setPreviewHtml(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="flex-1 border-none w-full"
              sandbox="allow-same-origin"
            />
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-dark-700">
              <Button variant="secondary" onClick={() => setPreviewHtml(null)}>
                بستن
              </Button>
              <Button onClick={() => { setPreviewHtml(null); handleExport("html"); }}>
                <FileCode size={16} className="ms-2" /> دانلود HTML
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  }
);

export default ExportModal;
