import React from "react";
import {
  WorkoutPlan,
  NutritionPlan,
  Athlete,
  TrainerProfile,
  ExportConfig,
} from "../../../types";
import { Modal, Card, Input, Label, Button } from "../../../components/UI";
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
} from "lucide-react";
import {
  downloadPlanAsHtml,
  downloadDietAsHtml,
  downloadProgressAsHtml,
  downloadPlanAsImage,
  downloadDietAsImage,
  downloadProgressAsImage,
} from "../../../services/exportService";

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
                      <span className="text-xs font-bold text-primary-60 bg-primary-100 px-2 py-0.5 rounded-full">
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
                  "#ef444",
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
                        : "border-gray-20 dark:border-dark-600 text-gray-40 hover:bg-gray-100 dark:hover:bg-dark-700"
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
                      : "bg-white dark:bg-dark-80 border-gray-100 dark:border-dark-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      exportConfig[opt.key as keyof ExportConfig]
                        ? "bg-primary-50 text-white"
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
                    <Check size={16} className="mr-auto text-primary-50" />
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
              onClick={() => handleExport("html")}
              className="flex-1 h-12 text-base bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black"
            >
              <FileCode size={18} className="ml-2" />
              دانلود فایل HTML
            </Button>
            <Button
              onClick={() => handleExport("image")}
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
    );
  }
);

export default ExportModal;
