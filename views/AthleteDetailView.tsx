
import React, { useState, useMemo } from 'react';
import { Athlete, WorkoutPlan, NutritionPlan, Measurement, View, PersonalRecord, Goal, WorkoutLogEntry } from '../types';
import { Card, Button, Input, Label, Modal } from '../components/UI';
import {
    Activity, TrendingUp, TrendingDown, Calendar, Trophy, ChevronRight, Plus,
    BarChart3, PieChart, Clock, Trash2 as Trash, Edit2 as Edit, ChevronDown, ChevronUp,
    MoreVertical, Target, Award, Dumbbell, Utensils, AlertCircle, Camera, Image as ImageIcon,
    ArrowRight, ArrowLeft, Share2, Brain, MessageSquare, Download, Flame, Zap, CheckCircle, Upload, X
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { deleteAthlete, deletePlan, deleteNutritionPlan, saveAthlete } from '../services/electronDb';
import {
    calculateBodyComposition, calculateProgress, calculateWorkoutAdherence,
    getPersonalRecords, calculateGoalProgress, generateWeeklyReport, compressImage
} from '../utils/helpers';

interface AthleteDetailViewProps {
    selectedAthlete: Athlete | null;
    plans: WorkoutPlan[];
    nutritionPlans: NutritionPlan[];
    chartMetric: string;
    isDarkMode: boolean;
    apiKey: string;
    setChartMetric: (metric: string) => void;
    setSelectedAthlete: (athlete: Athlete | null) => void;
    setEditingAthlete: (athlete: Athlete) => void;
    setIsAthleteModalOpen: (open: boolean) => void;
    setCurrentView: (view: View) => void;
    setPlanToExport: (plan: WorkoutPlan) => void;
    setDietToExport: (plan: NutritionPlan | null) => void;
    setProgressToExport: (athlete: Athlete | null) => void; // New prop
    setIsExportModalOpen: (open: boolean) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    refreshData: () => Promise<void>;
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

type TabType = 'overview' | 'analytics' | 'records' | 'plans' | 'history';

export const AthleteDetailView: React.FC<AthleteDetailViewProps> = ({
    selectedAthlete,
    plans,
    nutritionPlans,
    chartMetric,
    isDarkMode,
    apiKey,
    setChartMetric,
    setSelectedAthlete,
    setEditingAthlete,
    setIsAthleteModalOpen,
    setCurrentView,
    setPlanToExport,
    setDietToExport,
    setProgressToExport,
    setIsExportModalOpen,
    showConfirm,
    refreshData,
    addToast
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
    const [isAddPROpen, setIsAddPROpen] = useState(false);
    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
    const [aiInsights, setAiInsights] = useState<string>('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

    // Photo Comparison State
    const [compareDate1, setCompareDate1] = useState<string>('');
    const [compareDate2, setCompareDate2] = useState<string>('');
    const [compareAngle, setCompareAngle] = useState<'front' | 'side' | 'back'>('front');
    const [circumferenceMetric, setCircumferenceMetric] = useState<string>('waist');

    if (!selectedAthlete) return null;

    const athletePlans = plans.filter(p => p.athleteId === selectedAthlete.id);
    const athleteDiets = nutritionPlans.filter(p => p.athleteId === selectedAthlete.id);

    // Helper to save athlete updates
    const updateAthlete = async (updates: Partial<Athlete>) => {
        const updated = { ...selectedAthlete, ...updates };
        await saveAthlete(updated);
        setSelectedAthlete(updated);
        await refreshData();
    };

    // Calculate progress metrics
    const weightProgress = useMemo(() =>
        calculateProgress(selectedAthlete.measurements, 'weight'),
        [selectedAthlete.measurements]
    );

    const bodyFatProgress = useMemo(() =>
        calculateProgress(selectedAthlete.measurements, 'bodyFat'),
        [selectedAthlete.measurements]
    );

    const waistProgress = useMemo(() =>
        calculateProgress(selectedAthlete.measurements, 'waist'),
        [selectedAthlete.measurements]
    );

    // Workout adherence (last 30 days)
    const adherence = useMemo(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return calculateWorkoutAdherence(selectedAthlete.workoutLog, { start, end });
    }, [selectedAthlete.workoutLog]);

    // Recent PRs
    const recentPRs = useMemo(() =>
        getPersonalRecords(selectedAthlete).slice(0, 5),
        [selectedAthlete.personalRecords]
    );

    // Active goals
    const activeGoals = useMemo(() =>
        (selectedAthlete.goals || []).filter(g => !g.achieved),
        [selectedAthlete.goals]
    );

    // Body composition
    const latestMeasurement = selectedAthlete.measurements[selectedAthlete.measurements.length - 1];
    const bodyComp = useMemo(() =>
        calculateBodyComposition(latestMeasurement?.weight || 0, latestMeasurement?.bodyFat),
        [latestMeasurement]
    );

    // AI Insights Generator
    const generateAIInsights = async () => {
        if (!apiKey) {
            addToast('کلید API یافت نشد', 'لطفا ابتدا کلید API را در تنظیمات وارد کنید', 'error');
            return;
        }

        setIsLoadingAI(true);
        setIsAIInsightsOpen(true);

        try {
            const prompt = `تحلیل پیشرفت ورزشکار:
نام: ${selectedAthlete.fullName}
سن: ${selectedAthlete.age}
هدف: ${selectedAthlete.currentGoal || 'تعیین نشده'}

آمار اندازه‌گیری‌ها:
- وزن فعلی: ${latestMeasurement?.weight || 'N/A'} کیلوگرم
    - درصد چربی: ${latestMeasurement?.bodyFat || 'N/A'}%
        - تعداد اندازه‌گیری‌ها: ${selectedAthlete.measurements.length}
- تغییر وزن: ${weightProgress?.change.toFixed(1) || 'N/A'} کیلوگرم
    - تغییر چربی: ${bodyFatProgress?.change.toFixed(1) || 'N/A'}%

        رکوردهای شخصی: ${selectedAthlete.personalRecords?.length || 0}
تمرینات تکمیل شده(30 روز اخیر): ${adherence}%

    لطفا یک تحلیل کوتاه و کاربردی ارائه دهید که شامل:
1. ارزیابی پیشرفت کلی
2. نقاط قوت و ضعف
3. پیشنهادات بهبود(برنامه تمرینی یا تغذیه)
4. انگیزه و تشویق

پاسخ را به فارسی و در 4 - 5 پاراگراف کوتاه بنویس.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            const data = await response.json();
            const insights = data.candidates?.[0]?.content?.parts?.[0]?.text || 'خطا در دریافت تحلیل';
            setAiInsights(insights);
        } catch (error) {
            setAiInsights('خطا در ارتباط با سرور AI. لطفا دوباره تلاش کنید.');
        } finally {
            setIsLoadingAI(false);
        }
    };

    // Chart data for multi-metric comparison
    const multiMetricChartData = useMemo(() => {
        return selectedAthlete.measurements
            .slice(-10)
            .map(m => ({
                date: new Date(m.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
                weight: m.weight,
                bodyFat: m.bodyFat || null,
                waist: m.waist || null
            }));
    }, [selectedAthlete.measurements]);

    // Radar Chart Data (Proportions)
    const radarData = useMemo(() => {
        if (!selectedAthlete.measurements.length) return [];
        // Sort by date desc to get latest and oldest
        const sorted = [...selectedAthlete.measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const latest = sorted[0];
        const first = sorted[sorted.length - 1];

        const metrics = [
            { subject: 'شانه', key: 'shoulder' },
            { subject: 'سینه', key: 'chest' },
            { subject: 'کمر', key: 'waist' },
            { subject: 'باسن', key: 'hips' },
            { subject: 'ران', key: 'thighs' },
            { subject: 'بازو', key: 'arms' },
        ];

        return metrics.map(m => ({
            subject: m.subject,
            A: latest[m.key as keyof Measurement] || 0,
            B: first[m.key as keyof Measurement] || 0,
            fullMark: 150
        }));
    }, [selectedAthlete.measurements]);

    // Trend Chart Data (Specific Metric)
    const trendData = useMemo(() => {
        return selectedAthlete.measurements
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(m => ({
                date: new Date(m.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
                value: m[circumferenceMetric as keyof Measurement] || 0
            }));
    }, [selectedAthlete.measurements, circumferenceMetric]);

    // Pie chart data for body composition
    const bodyCompData = latestMeasurement?.bodyFat ? [
        { name: 'توده عضلانی', value: bodyComp.leanMass, color: '#10b981' },
        { name: 'توده چربی', value: bodyComp.fatMass, color: '#f59e0b' }
    ] : [];

    // Add Personal Record Handler
    const handleAddPR = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const newPR: PersonalRecord = {
            id: crypto.randomUUID(),
            exerciseName: data.get('exerciseName') as string,
            weight: parseFloat(data.get('weight') as string),
            reps: parseInt(data.get('reps') as string),
            date: data.get('date') as string,
            notes: data.get('notes') as string || undefined
        };

        await updateAthlete({
            personalRecords: [...(selectedAthlete.personalRecords || []), newPR]
        });

        setIsAddPROpen(false);
        addToast('رکورد شخصی ثبت شد!', '', 'success');
    };

    // Add Goal Handler
    const handleAddGoal = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const newGoal: Goal = {
            id: crypto.randomUUID(),
            title: data.get('title') as string,
            target: parseFloat(data.get('target') as string),
            current: parseFloat(data.get('current') as string),
            unit: data.get('unit') as string,
            deadline: data.get('deadline') as string || undefined,
            achieved: false,
            createdAt: new Date().toISOString()
        };

        await updateAthlete({
            goals: [...(selectedAthlete.goals || []), newGoal]
        });

        setIsAddGoalOpen(false);
        addToast('هدف جدید ثبت شد!', '', 'success');
    };

    // Add Measurement Handler
    const handleAddMeasurement = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        // Process photos
        const photos: { front?: string; side?: string; back?: string } = {};

        const frontFile = data.get('photoFront') as File;
        if (frontFile && frontFile.size > 0) {
            photos.front = await compressImage(frontFile);
        }

        const sideFile = data.get('photoSide') as File;
        if (sideFile && sideFile.size > 0) {
            photos.side = await compressImage(sideFile);
        }

        const backFile = data.get('photoBack') as File;
        if (backFile && backFile.size > 0) {
            photos.back = await compressImage(backFile);
        }

        const newMeasurement: Measurement = {
            date: data.get('date') as string,
            weight: parseFloat(data.get('weight') as string),
            bodyFat: parseFloat(data.get('bodyFat') as string) || undefined,
            waist: parseFloat(data.get('waist') as string) || undefined,
            chest: parseFloat(data.get('chest') as string) || undefined,
            arms: parseFloat(data.get('arms') as string) || undefined,
            notes: data.get('notes') as string || undefined,
            mood: parseInt(data.get('mood') as string) as 1 | 2 | 3 | 4 | 5 || undefined,
            photos: Object.keys(photos).length > 0 ? photos : undefined
        };

        await updateAthlete({
            measurements: [...selectedAthlete.measurements, newMeasurement]
        });

        setIsAddMeasurementOpen(false);
        addToast('اندازه‌گیری جدید ثبت شد!', '', 'success');
    };

    const tabs = [
        { id: 'overview' as TabType, label: 'خلاصه', icon: BarChart3 },
        { id: 'analytics' as TabType, label: 'تحلیل‌ها', icon: PieChart },
        { id: 'records' as TabType, label: 'رکوردها و اهداف', icon: Trophy },
        { id: 'plans' as TabType, label: 'برنامه‌ها', icon: Calendar },
        { id: 'history' as TabType, label: 'تاریخچه', icon: Clock }
    ];

    return (
        <div className="space-y-6 pb-24 animate-in slide-in-from-right-8 duration-300">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" onClick={() => setSelectedAthlete(null)} className="rounded-full w-10 h-10 p-0">
                    <ArrowLeft />
                </Button>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">پروفایل ورزشکار</h2>
            </div>

            {/* Athlete Profile Card */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-4xl font-black text-gray-400 dark:text-gray-500 border-4 border-white dark:border-dark-800 shadow-lg">
                        {selectedAthlete.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-right">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedAthlete.fullName}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{selectedAthlete.currentGoal || 'بدون هدف'}</p>
                        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <span className="text-sm text-gray-500 dark:text-gray-400">سن:</span>
                                <span className="font-bold text-lg mr-2 text-gray-900 dark:text-white">{selectedAthlete.age}</span>
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <span className="text-sm text-gray-500 dark:text-gray-400">قد:</span>
                                <span className="font-bold text-lg mr-2 text-gray-900 dark:text-white">{selectedAthlete.height} cm</span>
                            </div>
                            <div className="px-4 py- bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <span className="text-sm text-gray-500 dark:text-gray-400">وزن:</span>
                                <span className="font-bold text-lg mr-2 text-gray-900 dark:text-white">
                                    {latestMeasurement?.weight || '-'} kg
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setProgressToExport(selectedAthlete); setIsExportModalOpen(true); }}>
                            <Share2 size={16} className="ml-2" /> خروجی
                        </Button>
                        <Button variant="secondary" onClick={() => { setEditingAthlete(selectedAthlete); setIsAthleteModalOpen(true); }}>
                            <Edit size={16} className="ml-2" /> ویرایش
                        </Button>
                        <Button variant="danger" className="px-4" onClick={() => {
                            showConfirm('حذف ورزشکار', `آیا از حذف ${selectedAthlete.fullName} اطمینان دارید؟`, async () => {
                                await deleteAthlete(selectedAthlete.id);
                                refreshData();
                                setSelectedAthlete(null);
                                addToast('ورزشکار حذف شد');
                            });
                        }}>
                            <Trash size={18} />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-dark-800 p-2 rounded-2xl border border-gray-100 dark:border-dark-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary-600 text-white font-bold shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Progress Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تغییر وزن</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {weightProgress?.change.toFixed(1) || '0'} kg
                                    </p>
                                </div>
                                {weightProgress && (
                                    <div className={`p-2 rounded-lg ${weightProgress.isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                        {weightProgress.isPositive ? <TrendingDown className="text-green-600" size={20} /> : <TrendingUp className="text-red-600" size={20} />}
                                    </div>
                                )}
                            </div>
                            {weightProgress && (
                                <p className={`text-sm mt-2 ${weightProgress.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(weightProgress.changePercent).toFixed(1)}% از شروع
                                </p>
                            )}
                        </Card>

                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تغییر چربی</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {bodyFatProgress?.change.toFixed(1) || '0'}%
                                    </p>
                                </div>
                                {bodyFatProgress && (
                                    <div className={`p-2 rounded-lg ${bodyFatProgress.isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                        {bodyFatProgress.isPositive ? <TrendingDown className="text-green-600" size={20} /> : <TrendingUp className="text-red-600" size={20} />}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">میزان التزام</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">{adherence}%</p>
                                </div>
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <Activity className="text-blue-600" size={20} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">30 روز اخیر</p>
                        </Card>

                        <Card className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">رکوردهای ثبت شده</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {selectedAthlete.personalRecords?.length || 0}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                                    <Award className="text-amber-600" size={20} />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">اقدامات سریع</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button onClick={() => setIsAddMeasurementOpen(true)} variant="secondary" className="h-20 flex-col gap-2">
                                <Plus size={24} />
                                <span className="text-sm">اندازه‌گیری</span>
                            </Button>
                            <Button onClick={() => setIsAddPROpen(true)} variant="secondary" className="h-20 flex-col gap-2">
                                <Trophy size={24} />
                                <span className="text-sm">رکورد شخصی</span>
                            </Button>
                            <Button onClick={() => setIsAddGoalOpen(true)} variant="secondary" className="h-20 flex-col gap-2">
                                <Target size={24} />
                                <span className="text-sm">هدف جدید</span>
                            </Button>
                            <Button onClick={generateAIInsights} variant="secondary" className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                                <Brain size={24} className="text-purple-600" />
                                <span className="text-sm text-purple-700 dark:text-purple-400">تحلیل AI</span>
                            </Button>
                        </div>
                    </Card>

                    {/* Recent PRs */}
                    {recentPRs.length > 0 && (
                        <Card className="p-6">
                            <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy className="text-amber-500" size={20} />
                                آخرین رکوردها
                            </h4>
                            <div className="space-y-3">
                                {recentPRs.map(pr => (
                                    <div key={pr.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{pr.exerciseName}</p>
                                            <p className="text-sm text-gray-500">{new Date(pr.date).toLocaleDateString('fa-IR')}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-lg text-primary-600">{pr.weight} kg</p>
                                            <p className="text-sm text-gray-500">{pr.reps} تکرار</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Active Goals */}
                    {activeGoals.length > 0 && (
                        <Card className="p-6">
                            <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Target className="text-blue-500" size={20} />
                                اهداف فعال
                            </h4>
                            <div className="space-y-4">
                                {activeGoals.map(goal => {
                                    const progress = calculateGoalProgress(goal);
                                    return (
                                        <div key={goal.id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold text-gray-900 dark:text-white">{goal.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {goal.current} / {goal.target} {goal.unit}
                                                </p>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">{progress}% تکمیل شده</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>
            )}


            {
                activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Multi-Metric Chart */}
                        <Card className="p-6">
                            <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">مقایسه شاخص‌ها</h4>
                            <div className="h-64">
                                <ResponsiveContainer>
                                    <LineChart data={multiMetricChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="وزن (kg)" />
                                        <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="چربی (%)" />
                                        <Line type="monotone" dataKey="waist" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="دور کمر (cm)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Body Progress Comparison */}
                        <Card className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div className="flex items-center gap-2">
                                    <Camera className="text-purple-600" />
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">گالری پیشرفت بدنی</h4>
                                </div>

                                <div className="flex flex-wrap gap-2 text-sm">
                                    <button
                                        onClick={() => setCompareAngle('front')}
                                        className={`px-3 py-1 rounded-lg transition-colors ${compareAngle === 'front' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-dark-700'}`}
                                    >
                                        روبرو
                                    </button>
                                    <button
                                        onClick={() => setCompareAngle('side')}
                                        className={`px-3 py-1 rounded-lg transition-colors ${compareAngle === 'side' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-dark-700'}`}
                                    >
                                        نیم‌رخ
                                    </button>
                                    <button
                                        onClick={() => setCompareAngle('back')}
                                        className={`px-3 py-1 rounded-lg transition-colors ${compareAngle === 'back' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-dark-700'}`}
                                    >
                                        پشت
                                    </button>
                                </div>
                            </div>

                            {selectedAthlete.measurements.some(m => m.photos) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* First Photo Selection */}
                                    <div className="space-y-3">
                                        <select
                                            value={compareDate1}
                                            onChange={(e) => setCompareDate1(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm"
                                        >
                                            <option value="">انتخاب تاریخ اول...</option>
                                            {selectedAthlete.measurements
                                                .filter(m => m.photos && m.photos[compareAngle])
                                                .map((m, idx) => (
                                                    <option key={idx} value={m.date}>
                                                        {new Date(m.date).toLocaleDateString('fa-IR')} - (وزن: {m.weight})
                                                    </option>
                                                ))
                                            }
                                        </select>

                                        <div className="aspect-[3/4] bg-gray-100 dark:bg-dark-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-700">
                                            {compareDate1 ? (
                                                <img
                                                    src={selectedAthlete.measurements.find(m => m.date === compareDate1)?.photos?.[compareAngle]}
                                                    className="w-full h-full object-cover"
                                                    alt="Comparison 1"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <ImageIcon className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs">انتخاب کنید</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Second Photo Selection */}
                                    <div className="space-y-3">
                                        <select
                                            value={compareDate2}
                                            onChange={(e) => setCompareDate2(e.target.value)}
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm"
                                        >
                                            <option value="">انتخاب تاریخ دوم...</option>
                                            {selectedAthlete.measurements
                                                .filter(m => m.photos && m.photos[compareAngle])
                                                .map((m, idx) => (
                                                    <option key={idx} value={m.date}>
                                                        {new Date(m.date).toLocaleDateString('fa-IR')} - (وزن: {m.weight})
                                                    </option>
                                                ))
                                            }
                                        </select>

                                        <div className="aspect-[3/4] bg-gray-100 dark:bg-dark-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-700">
                                            {compareDate2 ? (
                                                <img
                                                    src={selectedAthlete.measurements.find(m => m.date === compareDate2)?.photos?.[compareAngle]}
                                                    className="w-full h-full object-cover"
                                                    alt="Comparison 2"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <ImageIcon className="mx-auto mb-2 opacity-50" />
                                                    <p className="text-xs">انتخاب کنید</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 dark:bg-dark-800 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                                    <Camera size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">هنوز عکس بدنی ثبت نشده است</p>
                                    <Button variant="secondary" className="mt-4" onClick={() => setIsAddMeasurementOpen(true)}>
                                        ثبت اولین عکس
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Body Composition */}
                        {bodyCompData.length > 0 && (
                            <Card className="p-6">
                                <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">ترکیب بدنی</h4>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="h-48 w-48">
                                        <ResponsiveContainer>
                                            <RechartsPieChart>
                                                <Pie
                                                    data={bodyCompData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {bodyCompData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                            <span className="font-bold text-gray-900 dark:text-white">توده عضلانی</span>
                                            <span className="text-lg font-black text-emerald-600">{bodyComp.leanMass.toFixed(1)} kg</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                            <span className="font-bold text-gray-900 dark:text-white">توده چربی</span>
                                            <span className="text-lg font-black text-amber-600">{bodyComp.fatMass.toFixed(1)} kg</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <span className="font-bold text-gray-900 dark:text-white">درصد چربی</span>
                                            <span className="text-lg font-black text-blue-600">{latestMeasurement?.bodyFat}%</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Radar Chart & Trends */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="p-6">
                                <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">تغییرات سایز (تناسب اندام)</h4>
                                <div className="h-64">
                                    <ResponsiveContainer>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                            <Radar name="شروع" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                                            <Radar name="فعلی" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">روند تغییرات سایز</h4>
                                    <select
                                        value={circumferenceMetric}
                                        onChange={(e) => setCircumferenceMetric(e.target.value)}
                                        className="p-1 rounded-lg text-xs border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800"
                                    >
                                        <option value="weight">وزن</option>
                                        <option value="bodyFat">درصد چربی</option>
                                        <option value="neck">گردن</option>
                                        <option value="shoulder">شانه</option>
                                        <option value="chest">سینه</option>
                                        <option value="arms">بازو</option>
                                        <option value="forearms">ساعد</option>
                                        <option value="waist">کمر</option>
                                        <option value="hips">باسن</option>
                                        <option value="thighs">ران</option>
                                        <option value="calves">ساق</option>
                                    </select>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer>
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </div>
                )
            }

            {activeTab === 'records' && (
                <div className="space-y-6">
                    {/* Personal Records */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">رکوردهای شخصی</h4>
                            <Button onClick={() => setIsAddPROpen(true)} size="sm">
                                <Plus size={16} className="ml-2" /> افزودن رکورد
                            </Button>
                        </div>
                        {(selectedAthlete.personalRecords || []).length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <Award size={48} className="mx-auto mb-3 opacity-30" />
                                <p>هنوز رکوردی ثبت نشده است</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {(selectedAthlete.personalRecords || [])
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map(pr => (
                                        <div key={pr.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                                                    <Trophy className="text-amber-600" size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{pr.exerciseName}</p>
                                                    <p className="text-sm text-gray-500">{new Date(pr.date).toLocaleDateString('fa-IR')}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-xl text-primary-600">{pr.weight} kg</p>
                                                <p className="text-sm text-gray-500">{pr.reps} تکرار</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </Card>

                    {/* Goals */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">اهداف</h4>
                            <Button onClick={() => setIsAddGoalOpen(true)} size="sm">
                                <Plus size={16} className="ml-2" /> هدف جدید
                            </Button>
                        </div>
                        {(selectedAthlete.goals || []).length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <Target size={48} className="mx-auto mb-3 opacity-30" />
                                <p>هنوز هدفی تعریف نشده است</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(selectedAthlete.goals || []).map(goal => {
                                    const progress = calculateGoalProgress(goal);
                                    return (
                                        <div key={goal.id} className={`p-4 rounded-xl ${goal.achieved ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-dark-700'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        {goal.title}
                                                        {goal.achieved && <CheckCircle className="text-green-600" size={18} />}
                                                    </p>
                                                    {goal.deadline && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            موعد: {new Date(goal.deadline).toLocaleDateString('fa-IR')}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {goal.current} / {goal.target} {goal.unit}
                                                </p>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${goal.achieved ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">{progress}% تکمیل شده</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            )
            }

            {
                activeTab === 'plans' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => setCurrentView('plan-builder')} className="h-14 text-lg">
                                <Plus size={20} className="ml-2" /> برنامه تمرینی جدید
                            </Button>
                            <Button onClick={() => setCurrentView('nutrition-builder')} variant="secondary" className="h-14 text-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50">
                                <Utensils size={20} className="ml-2" /> رژیم غذایی جدید
                            </Button>
                        </div>

                        <h4 className="font-bold text-lg text-gray-900 dark:text-white mt-4">برنامه‌های فعال</h4>
                        {athletePlans.length === 0 && athleteDiets.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 dark:bg-dark-800 rounded-3xl border border-dashed border-gray-200 dark:border-dark-700">
                                <p className="text-gray-400">هیچ برنامه‌ای ثبت نشده است</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Workout Plans */}
                            {athletePlans.map(plan => (
                                <Card key={plan.id} className="p-0 flex flex-col md:flex-row overflow-hidden group">
                                    <div className="bg-blue-600 text-white w-full md:w-24 flex items-center justify-center p-4 md:p-0">
                                        <Dumbbell size={32} />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-center">
                                        <h5 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h5>
                                        <p className="text-sm text-gray-500 mt-1">{plan.days.length} روز تمرینی • تاریخ: {new Date(plan.created_at).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                    <div className="p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-100 dark:border-dark-700">
                                        <Button size="sm" variant="ghost" onClick={() => { setPlanToExport(plan); setDietToExport(null); setIsExportModalOpen(true); }}>
                                            <Share2 size={18} />
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => showConfirm('حذف برنامه', 'آیا از حذف این برنامه مطمئن هستید؟', async () => { await deletePlan(plan.id); refreshData(); })}>
                                            <Trash size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            ))}

                            {/* Nutrition Plans */}
                            {athleteDiets.map(plan => (
                                <Card key={plan.id} className="p-0 flex flex-col md:flex-row overflow-hidden group">
                                    <div className="bg-emerald-600 text-white w-full md:w-24 flex items-center justify-center p-4 md:p-0">
                                        <Utensils size={32} />
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col justify-center">
                                        <h5 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h5>
                                        <p className="text-sm text-gray-500 mt-1">{plan.days.length} روز رژیم • تاریخ: {new Date(plan.created_at).toLocaleDateString('fa-IR')}</p>
                                    </div>
                                    <div className="p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-100 dark:border-dark-700">
                                        <Button size="sm" variant="ghost" onClick={() => { setDietToExport(plan); setPlanToExport(null); setIsExportModalOpen(true); }}>
                                            <Share2 size={18} />
                                        </Button>
                                        <Button size="sm" variant="danger" onClick={() => showConfirm('حذف رژیم', 'آیا از حذف این رژیم مطمئن هستید؟', async () => { await deleteNutritionPlan(plan.id); refreshData(); })}>
                                            <Trash size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'history' && (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">تاریخچه اندازه‌گیری‌ها</h4>
                                <Button onClick={() => setIsAddMeasurementOpen(true)} size="sm">
                                    <Plus size={16} className="ml-2" /> اندازه‌گیری جدید
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-dark-700">
                                            <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">تاریخ</th>
                                            <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">وزن</th>
                                            <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">چربی</th>
                                            <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">دور کمر</th>
                                            <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">عکس</th>
                                            <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">یادداشت</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...selectedAthlete.measurements]
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((m, idx) => (
                                                <tr key={idx} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700">
                                                    <td className="p-3 text-sm">{new Date(m.date).toLocaleDateString('fa-IR')}</td>
                                                    <td className="p-3 text-sm font-bold">{m.weight} kg</td>
                                                    <td className="p-3 text-sm">{m.bodyFat || '-'}%</td>
                                                    <td className="p-3 text-sm">{m.waist || '-'} cm</td>
                                                    <td className="p-3 text-sm">
                                                        <div className="flex gap-1">
                                                            {m.photos?.front && <div title="روبرو" className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                                            {m.photos?.side && <div title="نیم‌رخ" className="w-2 h-2 rounded-full bg-green-500"></div>}
                                                            {m.photos?.back && <div title="پشت" className="w-2 h-2 rounded-full bg-purple-500"></div>}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-sm text-gray-500">{m.notes || '-'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* Modals */}

            {/* Add Measurement Modal */}
            <Modal isOpen={isAddMeasurementOpen} onClose={() => setIsAddMeasurementOpen(false)} title="اندازه‌گیری جدید">
                <form onSubmit={handleAddMeasurement} className="space-y-4">
                    <div>
                        <Label>تاریخ</Label>
                        <Input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>وزن (kg) *</Label>
                            <Input type="number" step="0.1" name="weight" required />
                        </div>
                        <div>
                            <Label>درصد چربی (%)</Label>
                            <Input type="number" step="0.1" name="bodyFat" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>دور کمر (cm)</Label>
                            <Input type="number" step="0.1" name="waist" />
                        </div>
                        <div>
                            <Label>دور سینه (cm)</Label>
                            <Input type="number" step="0.1" name="chest" />
                        </div>
                        <div>
                            <Label>دور بازو (cm)</Label>
                            <Input type="number" step="0.1" name="arms" />
                        </div>
                    </div>

                    {/* Photo Upload Section */}
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                        <Label className="flex items-center gap-2">
                            <Camera size={16} /> عکس‌های وضعیت بدنی
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <Label className="block text-xs mb-1">روبرو</Label>
                                <Input type="file" name="photoFront" accept="image/*" className="text-xs" />
                            </div>
                            <div className="text-center">
                                <Label className="block text-xs mb-1">نیم‌رخ</Label>
                                <Input type="file" name="photoSide" accept="image/*" className="text-xs" />
                            </div>
                            <div className="text-center">
                                <Label className="block text-xs mb-1">پشت</Label>
                                <Input type="file" name="photoBack" accept="image/*" className="text-xs" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>حال عمومی</Label>
                        <select name="mood" className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                            <option value="">انتخاب کنید</option>
                            <option value="5">عالی 😄</option>
                            <option value="4">خوب 🙂</option>
                            <option value="3">متوسط 😐</option>
                            <option value="2">ضعیف 😕</option>
                            <option value="1">بد 😞</option>
                        </select>
                    </div>
                    <div>
                        <Label>یادداشت</Label>
                        <textarea name="notes" rows={3} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                    </div>
                    <Button type="submit" className="w-full">ثبت اندازه‌گیری</Button>
                </form>
            </Modal>

            {/* Add PR Modal */}
            <Modal isOpen={isAddPROpen} onClose={() => setIsAddPROpen(false)} title="رکورد شخصی جدید">
                <form onSubmit={handleAddPR} className="space-y-4">
                    <div>
                        <Label>نام تمرین *</Label>
                        <Input type="text" name="exerciseName" placeholder="مثلا: پرس سینه" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>وزن (kg) *</Label>
                            <Input type="number" step="0.5" name="weight" required />
                        </div>
                        <div>
                            <Label>تعداد تکرار *</Label>
                            <Input type="number" name="reps" required />
                        </div>
                    </div>
                    <div>
                        <Label>تاریخ *</Label>
                        <Input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>
                    <div>
                        <Label>یادداشت</Label>
                        <textarea name="notes" rows={2} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                    </div>
                    <Button type="submit" className="w-full">ثبت رکورد</Button>
                </form>
            </Modal>

            {/* Add Goal Modal */}
            <Modal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} title="هدف جدید">
                <form onSubmit={handleAddGoal} className="space-y-4">
                    <div>
                        <Label>عنوان هدف *</Label>
                        <Input type="text" name="title" placeholder="مثلا: رسیدن به وزن ۸۰ کیلو" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label>وضعیت فعلی *</Label>
                            <Input type="number" step="0.1" name="current" required />
                        </div>
                        <div>
                            <Label>هدف *</Label>
                            <Input type="number" step="0.1" name="target" required />
                        </div>
                        <div>
                            <Label>واحد *</Label>
                            <Input type="text" name="unit" placeholder="kg" required />
                        </div>
                    </div>
                    <div>
                        <Label>موعد (اختیاری)</Label>
                        <Input type="date" name="deadline" />
                    </div>
                    <Button type="submit" className="w-full">ایجاد هدف</Button>
                </form>
            </Modal>

            {/* AI Insights Modal */}
            <Modal isOpen={isAIInsightsOpen} onClose={() => setIsAIInsightsOpen(false)} title="تحلیل هوش مصنوعی">
                {isLoadingAI ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                        <p className="text-gray-500">در حال تحلیل داده‌ها...</p>
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {aiInsights}
                        </div>
                    </div>
                )}
            </Modal>
        </div >
    );
};
