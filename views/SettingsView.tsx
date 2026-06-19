import React, { useState, useRef } from "react";
import { TrainerProfile } from "../types";
import { Card, Button, Label, Input, Select } from "../components/UI";
import {
  User,
  Palette,
  Database,
  Briefcase,
  Phone,
  Award,
  Check,
  Eye,
  Moon,
  Sun,
  Shield,
  FileImage,
  ImageIcon,
  Download,
  Upload,
  Trash,
  RefreshCw,
  AlertOctagon,
  X,
  Plus,
  Info,
  Github,
  Mail,
  DownloadCloud,
} from "lucide-react";
import {
  saveTrainerProfile,
  exportDatabase,
  importDatabase,
  resetDatabaseStore,
} from "../services/electronDb";

interface SettingsViewProps {
  trainerProfile: TrainerProfile | null;
  setTrainerProfile: (profile: TrainerProfile) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  appColor: string;
  setAppColor: (color: string) => void;
  isBoldTheme: boolean;
  setIsBoldTheme: (bold: boolean) => void;
  COLOR_PALETTES: Record<
    string,
    { label: string; colors: Record<string, string> }
  >;
  compressImage: (file: File) => Promise<string>;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: "danger" | "primary"
  ) => void;
  refreshData: () => Promise<void>;
  addToast: (
    title: string,
    message?: string,
    type?: "success" | "error" | "info"
  ) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trainerProfile,
  setTrainerProfile,
  isDarkMode,
  setIsDarkMode,
  appColor,
  setAppColor,
  isBoldTheme,
  setIsBoldTheme,
  COLOR_PALETTES,
  compressImage,
  showConfirm,
  refreshData,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "branding" | "data" | "about"
  >("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [certs, setCerts] = useState<string[]>(
    trainerProfile?.certifications || []
  );
  const [newCert, setNewCert] = useState("");

  const addCert = () => {
    if (newCert.trim() && !certs.includes(newCert.trim())) {
      setCerts([...certs, newCert.trim()]);
      setNewCert("");
    }
  };

  const removeCert = (cert: string) => {
    setCerts(certs.filter((c) => c !== cert));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      const success = await importDatabase(content);
      if (success) {
        addToast("اطلاعات با موفقیت بازیابی شد");
        refreshData();
      } else {
        addToast("خطا در بازیابی اطلاعات", "فایل نامعتبر است", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const logoFile = formData.get("logo") as File;
    const signatureFile = formData.get("signature") as File;

    let logoUrl = trainerProfile?.logoUrl;
    let signatureUrl = trainerProfile?.signatureUrl;

    if (logoFile && logoFile.size > 0) {
      logoUrl = await compressImage(logoFile);
    }
    if (signatureFile && signatureFile.size > 0) {
      signatureUrl = await compressImage(signatureFile);
    }

    const profile: TrainerProfile = {
      name: formData.get("name") as string,
      clubName: formData.get("clubName") as string,
      slogan: formData.get("slogan") as string,
      bio: formData.get("bio") as string,
      phone: formData.get("phone") as string,
      instagram: formData.get("instagram") as string,
      telegram: formData.get("telegram") as string,
      email: formData.get("email") as string,
      website: formData.get("website") as string,
      certifications: certs,
      logoUrl,
      signatureUrl,
    };
    await saveTrainerProfile(profile);
    setTrainerProfile(profile);
    addToast("تنظیمات ذخیره شد");
  };

  const handleReset = (store: "athletes" | "plans" | "all") => {
    let message = "";
    if (store === "athletes")
      message = "تمامی ورزشکاران و سوابق آن‌ها حذف خواهند شد.";
    if (store === "plans")
      message = "تمامی برنامه‌های تمرینی و غذایی حذف خواهند شد.";
    if (store === "all")
      message =
        "تمامی اطلاعات برنامه شامل تنظیمات و پروفایل پاک خواهند شد (بازگشت به کارخانه).";

    showConfirm(
      "منطقه خطر!",
      message,
      async () => {
        await resetDatabaseStore(store);
        refreshData();
        addToast("عملیات با موفقیت انجام شد", "", "info");
        if (store === "all") window.location.reload();
      },
      "danger"
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
        تنظیمات
      </h2>

      {/* Settings Tabs */}
      <div className="flex bg-gray-100 dark:bg-dark-800 p-1.5 rounded-2xl sticky top-0 z-10 overflow-x-auto no-scrollbar">
        {[
          { id: "profile", icon: User, label: "پروفایل و هویت" },
          { id: "branding", icon: Palette, label: "ظاهر و برندینگ" },
          { id: "data", icon: Database, label: "مدیریت داده‌ها" },
          { id: "about", icon: Info, label: "درباره" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-700 pb-4">
                  <Briefcase size={20} className="text-primary-500" />
                  اطلاعات هویت کسب و کار
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Label>
                      نام و نام خانوادگی <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Input
                        name="name"
                        defaultValue={trainerProfile?.name}
                        placeholder="نام شما"
                        className="pr-12"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>نام باشگاه / برند</Label>
                    <div className="relative">
                      <Shield
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Input
                        name="clubName"
                        defaultValue={trainerProfile?.clubName}
                        placeholder="مثلا: باشگاه انرژی"
                        className="pr-12"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>شعار تبلیغاتی</Label>
                    <div className="relative">
                      <Award
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Input
                        name="slogan"
                        defaultValue={trainerProfile?.slogan}
                        placeholder="مثلا: سلامتی شما، اولویت ماست"
                        className="pr-12"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label>درباره شما (Bio)</Label>
                    <textarea
                      name="bio"
                      defaultValue={trainerProfile?.bio}
                      className="w-full min-h-[100px] p-4 rounded-2xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-800 dark:border-dark-700 dark:text-white resize-none"
                      placeholder="توضیح کوتاهی درباره سوابق و تخصص خود بنویسید..."
                    ></textarea>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-700 pb-4">
                  <Phone size={20} className="text-green-500" />
                  راه‌های ارتباطی
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <Label>شماره تماس</Label>
                    <Input
                      name="phone"
                      defaultValue={trainerProfile?.phone}
                      dir="ltr"
                      className="text-left pl-10 font-mono"
                      placeholder="0912..."
                    />
                    <Phone
                      className="absolute left-4 top-[34px] text-gray-400"
                      size={16}
                    />
                  </div>
                  <div className="relative">
                    <Label>اینستاگرام</Label>
                    <Input
                      name="instagram"
                      defaultValue={trainerProfile?.instagram}
                      dir="ltr"
                      className="text-left pl-10 font-mono"
                      placeholder="@username"
                    />
                    <span className="absolute left-4 top-[34px] text-gray-400 text-xs font-bold">
                      IG
                    </span>
                  </div>
                  <div className="relative">
                    <Label>تلگرام/پیام‌رسان</Label>
                    <Input
                      name="telegram"
                      defaultValue={trainerProfile?.telegram}
                      dir="ltr"
                      className="text-left pl-10 font-mono"
                      placeholder="@username"
                    />
                    <span className="absolute left-4 top-[34px] text-gray-400 text-xs font-bold">
                      TG
                    </span>
                  </div>
                  <div className="relative">
                    <Label>ایمیل</Label>
                    <Input
                      name="email"
                      defaultValue={trainerProfile?.email}
                      dir="ltr"
                      className="text-left pl-10 font-mono"
                      placeholder="info@example.com"
                    />
                    <span className="absolute left-4 top-[34px] text-gray-400 text-xs font-bold">
                      @
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-700 pb-4">
                  <Award size={20} className="text-amber-500" />
                  مدارک و افتخارات
                </h3>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="مثلا: مدرک مربیگری درجه ۲"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCert();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addCert}
                    className="shrink-0 aspect-square w-12 flex items-center justify-center rounded-xl p-0"
                  >
                    <Plus size={24} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certs.map((cert, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
                    >
                      <Award size={14} className="text-amber-500" />
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCert(cert)}
                        className="hover:text-red-500 mr-2 opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {certs.length === 0 && (
                    <span className="text-sm text-gray-400 italic">
                      هنوز مدرکی اضافه نشده است.
                    </span>
                  )}
                </div>
              </Card>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                  پیش‌نمایش کارت ویزیت
                </h3>
                <div className="bg-white dark:bg-dark-800 rounded-3xl overflow-hidden shadow-2xl relative border border-gray-100 dark:border-dark-700 aspect-[9/16] sm:aspect-[4/3] lg:aspect-[9/16] flex flex-col">
                  {/* Abstract Header Background */}
                  <div className="h-1/3 w-full bg-gradient-to-br from-primary-600 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {trainerProfile?.logoUrl ? (
                        <img
                          src={trainerProfile.logoUrl}
                          className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-white/20 backdrop-blur-sm"
                          alt="Logo"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl font-black border-2 border-white/30">
                          {trainerProfile?.name?.charAt(0) || "M"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-6 flex flex-col items-center text-center -mt-6">
                    <div className="relative z-10 w-full">
                      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {trainerProfile?.name || "نام مربی"}
                      </h2>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mb-1">
                        {trainerProfile?.clubName || "نام باشگاه"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-6 line-clamp-1">
                        {trainerProfile?.slogan ||
                          "شعار شما در اینجا قرار می‌گیرد"}
                      </p>
                    </div>

                    <div className="w-full space-y-3 mt-auto">
                      {trainerProfile?.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
                          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                            <Phone size={14} />
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 dir-ltr">
                            {trainerProfile.phone}
                          </span>
                        </div>
                      )}
                      {trainerProfile?.instagram && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
                          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
                            <ImageIcon size={14} />
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 dir-ltr">
                            @{trainerProfile.instagram.replace("@", "")}
                          </span>
                        </div>
                      )}
                      {!trainerProfile?.phone && !trainerProfile?.instagram && (
                        <div className="text-center text-gray-400 text-xs py-4">
                          اطلاعات تماس خود را وارد کنید تا در اینجا نمایش داده
                          شود
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    این پیش‌نمایش نحوه نمایش اطلاعات شما در هدر برنامه‌های
                    صادراتی را شبیه‌سازی می‌کند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Palette size={20} className="text-purple-500" /> تم رنگی برنامه
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Object.entries(COLOR_PALETTES).map(
                  ([key, palette]: [
                    string,
                    { label: string; colors: Record<string, string> }
                  ]) => (
                    <div
                      key={key}
                      onClick={() => setAppColor(key)}
                      className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col items-center gap-3 ${
                        appColor === key
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-100 dark:border-dark-700 hover:border-gray-200 dark:hover:border-dark-600"
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-transform"
                        style={{
                          backgroundColor: `rgb(${palette.colors["500"]})`,
                        }}
                      >
                        {appColor === key && (
                          <Check className="text-white" size={24} />
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          appColor === key
                            ? "text-primary-700 dark:text-primary-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {palette.label}
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Eye size={20} className="text-blue-500" /> تنظیمات ظاهری
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    {isDarkMode ? (
                      <Moon size={24} className="text-purple-500" />
                    ) : (
                      <Sun size={24} className="text-amber-500" />
                    )}
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        حالت شب (Dark Mode)
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        تغییر ظاهر برنامه به تیره
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors relative ${
                      isDarkMode ? "bg-primary-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                        isDarkMode ? "translate-x-[-24px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <Shield
                      size={24}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">
                        حالت بولد (Bold Theme)
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ضخیم کردن خطوط و فونت‌ها
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBoldTheme(!isBoldTheme)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors relative ${
                      isBoldTheme ? "bg-primary-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                        isBoldTheme ? "translate-x-[-24px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <FileImage size={20} className="text-pink-500" /> تصاویر برند
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-dark-900 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 text-center">
                  <Label className="mb-3 block">لوگو (تصویر)</Label>
                  <div className="flex flex-col items-center gap-3">
                    {trainerProfile?.logoUrl ? (
                      <img
                        src={trainerProfile.logoUrl}
                        className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                        alt="logo"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-gray-400">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <label className="cursor-pointer bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      انتخاب فایل
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-dark-900 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 text-center">
                  <Label className="mb-3 block">امضای دیجیتال</Label>
                  <div className="flex flex-col items-center gap-3">
                    {trainerProfile?.signatureUrl ? (
                      <img
                        src={trainerProfile.signatureUrl}
                        className="h-16 object-contain bg-white rounded-lg p-2"
                        alt="sign"
                      />
                    ) : (
                      <div className="w-full h-16 rounded-lg bg-gray-200 dark:bg-dark-700 flex items-center justify-center text-gray-400 text-xs">
                        بدون امضا
                      </div>
                    )}
                    <label className="cursor-pointer bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                      انتخاب فایل
                      <input
                        type="file"
                        name="signature"
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === "data" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Database size={20} className="text-emerald-500" /> پشتیبان‌گیری
              </h3>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-start h-14"
                  onClick={async () => {
                    const data = await exportDatabase();
                    const blob = new Blob([data], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `morabi-backup-${
                      new Date().toISOString().split("T")[0]
                    }.json`;
                    a.click();
                  }}
                >
                  <Download size={20} className="ml-2 text-emerald-600" />{" "}
                  دانلود فایل پشتیبان (Backup)
                </Button>
                <div className="relative">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full justify-start h-14"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={20} className="ml-2 text-primary-600" />{" "}
                    بازگردانی اطلاعات (Restore)
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertOctagon size={20} /> منطقه خطر
              </h3>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="danger"
                  className="w-full justify-start h-12 bg-white dark:bg-dark-800 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => handleReset("athletes")}
                >
                  <Trash size={18} className="ml-2" /> حذف تمام ورزشکاران
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="w-full justify-start h-12 bg-white dark:bg-dark-800 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30"
                  onClick={() => handleReset("plans")}
                >
                  <Trash size={18} className="ml-2" /> حذف تمام برنامه‌ها
                </Button>
                <div className="pt-2 border-t border-red-200 dark:border-red-900/30">
                  <Button
                    type="button"
                    variant="danger"
                    className="w-full h-14 font-black"
                    onClick={() => handleReset("all")}
                  >
                    <RefreshCw size={20} className="ml-2" /> بازگشت به تنظیمات
                    کارخانه (Reset App)
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* App Info and Developer Info */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Info size={20} className="text-blue-500" />
                    درباره برنامه
                  </h3>

                  <div className="space-y-6">
                    {/* App Information */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                          <Shield
                            className="text-indigo-600 dark:text-indigo-400"
                            size={24}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                            MetalPlans
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-300">
                                نسخه
                              </span>
                              <span className="font-bold text-gray-800 dark:text-white">
                                ۱.۱.۰
                              </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-300">
                                توسعه‌دهنده
                              </span>
                              <span className="font-bold text-gray-800 dark:text-white">
                                Metal Team
                              </span>
                            </div>
                            <div className="pt-2">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                یک داشبورد جامع برای مربیان بدنسازی جهت مدیریت
                                ورزشکاران، ایجاد برنامه‌های تمرینی و محاسبه
                                آمار، با رابطی مدرن به سبک iOS و به زبان فارسی.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Developer Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                          <User
                            className="text-blue-600 dark:text-blue-400"
                            size={24}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                            توسعه‌دهنده
                          </h4>
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800/50 rounded-xl">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <User size={18} />
                              </div>
                              <span className="font-bold text-gray-800 dark:text-white">
                                علی مرسلی
                              </span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800/50 rounded-xl">
                              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <Mail size={18} />
                              </div>
                              <a
                                href="mailto:ali.morsali.2000@gmail.com"
                                className="text-gray-700 dark:text-gray-300 font-bold dir-ltr underline hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[calc(100%-2.5rem)]"
                              >
                                ali.morsali.2000@gmail.com
                              </a>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800/50 rounded-xl">
                              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Github size={18} />
                              </div>
                              <a
                                href="https://github.com/kindterrorist"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 dark:text-gray-300 font-bold dir-ltr underline hover:text-purple-600 dark:hover:text-purple-400 truncate max-w-[calc(100%-2.5rem)]"
                              >
                                github.com/kindterrorist
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Update Section and Additional Info */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <DownloadCloud size={20} className="text-green-500" />
                    بروزرسانی برنامه
                  </h3>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800/30">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <DownloadCloud
                          className="text-green-600 dark:text-green-400"
                          size={32}
                        />
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white mb-2">
                        نسخه جدید در دسترس است
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        نسخه ۱.۱ شامل ویژگی‌های جدید و رفع مشکلات
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        className="bg-green-600 hover:bg-green-700 text-white h-12 w-full"
                      >
                        چک کردن بروزرسانی‌ها
                      </Button>
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800/30 w-full">
                        <div className="flex flex-wrap justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span>آخرین بررسی: امروز</span>
                          <span>برنامه به‌صورت خودکار چک می‌شود</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Additional Info Section */}
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Info size={20} className="text-amber-500" />
                    اطلاعات بیشتر
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                        راهنمای استفاده
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        برای راهنمای استفاده از برنامه، به بخش آموزش‌ها مراجعه
                        کنید.
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700">
                      <h4 className="font-bold text-gray-800 dark:text-white mb-2">
                        پشتیبانی
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        در صورت بروز هرگونه مشکل، از طریق ایمیل با ما در ارتباط
                        باشید.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Floating Save Button */}
        {(activeTab === "profile" || activeTab === "branding") && (
          <div className="sticky bottom-4 z-10 pt-4">
            <Button
              type="submit"
              className="w-full h-14 text-lg shadow-xl shadow-primary-200 dark:shadow-none bg-primary-600 hover:bg-primary-700"
            >
              ذخیره تنظیمات
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
