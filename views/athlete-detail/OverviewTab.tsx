import React, { useMemo, useState } from 'react';
import { Card, Button } from '../../components/UI';
import {
    Activity, TrendingUp, TrendingDown, Trophy, Plus, Target, Award, Brain
} from 'lucide-react';
import { useAthleteContext } from './AthleteContext';
import {
    calculateProgress, calculateWorkoutAdherence,
    getPersonalRecords, calculateGoalProgress
} from '../../utils/helpers';

interface Props {
    setIsAddMeasurementOpen: (open: boolean) => void;
    setIsAddPROpen: (open: boolean) => void;
    setIsAddGoalOpen: (open: boolean) => void;
    setIsAIInsightsOpen: (open: boolean) => void;
    setAiInsights: (insights: string) => void;
    setIsLoadingAI: (loading: boolean) => void;
}

export const OverviewTab: React.FC<Props> = ({
    setIsAddMeasurementOpen,
    setIsAddPROpen,
    setIsAddGoalOpen,
    setIsAIInsightsOpen,
    setAiInsights,
    setIsLoadingAI
}) => {
    const { athlete, apiKey, addToast } = useAthleteContext();

    const weightProgress = useMemo(() =>
        calculateProgress(athlete.measurements, 'weight'),
        [athlete.measurements]
    );

    const bodyFatProgress = useMemo(() =>
        calculateProgress(athlete.measurements, 'bodyFat'),
        [athlete.measurements]
    );

    const adherence = useMemo(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return calculateWorkoutAdherence(athlete.workoutLog || [], { start, end });
    }, [athlete.workoutLog]);

    const recentPRs = useMemo(() =>
        getPersonalRecords(athlete).slice(0, 5),
        [athlete.personalRecords]
    );

    const activeGoals = useMemo(() =>
        (athlete.goals || []).filter(g => !g.achieved),
        [athlete.goals]
    );

    const latestMeasurement = athlete.measurements[athlete.measurements.length - 1];

    const generateAIInsights = async () => {
        if (!apiKey) {
            addToast('کلید API یافت نشد', 'لطفا ابتدا کلید API را در تنظیمات وارد کنید', 'error');
            return;
        }

        setIsLoadingAI(true);
        setIsAIInsightsOpen(true);

        try {
            const prompt = `تحلیل پیشرفت ورزشکار:
نام: ${athlete.fullName}
سن: ${athlete.age}
هدف: ${athlete.currentGoal || 'تعیین نشده'}

آمار اندازه‌گیری‌ها:
- وزن فعلی: ${latestMeasurement?.weight || 'N/A'} کیلوگرم
    - درصد چربی: ${latestMeasurement?.bodyFat || 'N/A'}%
        - تعداد اندازه‌گیری‌ها: ${athlete.measurements.length}
- تغییر وزن: ${weightProgress?.change.toFixed(1) || 'N/A'} کیلوگرم
    - تغییر چربی: ${bodyFatProgress?.change.toFixed(1) || 'N/A'}%

        رکوردهای شخصی: ${athlete.personalRecords?.length || 0}
تمرینات تکمیل شده(30 روز اخیر): ${adherence}%

    لطفا یک تحلیل کوتاه و کاربردی ارائه دهید که شامل:
1. ارزیابی پیشرفت کلی
2. نقاط قوت و ضعف
3. پیشنهادات بهبود(برنامه تمرینی یا تغذیه)
4. انگیزه و تشویق

پاسخ را به فارسی و در 4 - 5 پاراگراف کوتاه بنویس.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

    return (
        <div className="space-y-6">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">30 روز اخیر</p>
                </Card>

                <Card className="p-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">رکوردهای ثبت شده</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {athlete.personalRecords?.length || 0}
                            </p>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                            <Award className="text-amber-600" size={20} />
                        </div>
                    </div>
                </Card>
            </div>

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

            <Card className="p-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy className="text-amber-500" size={20} />
                    آخرین رکوردها
                </h4>
                {recentPRs.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-dark-800 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                        <Trophy size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">هنوز رکوردی ثبت نشده</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">از بخش رکوردها اولین رکورد خود را ثبت کنید</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentPRs.map(pr => (
                            <div key={pr.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-xl">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{pr.exerciseName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(pr.date).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-lg text-primary-600">{pr.weight} kg</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{pr.reps} تکرار</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card className="p-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="text-blue-500" size={20} />
                    اهداف فعال
                </h4>
                {activeGoals.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-dark-800 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                        <Target size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">هنوز هدفی تعریف نشده</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">هدفی تعیین کنید و پیشرفت خود را دنبال کنید</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeGoals.map(goal => {
                            const progress = calculateGoalProgress(goal);
                            return (
                                <div key={goal.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-gray-900 dark:text-white">{goal.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {goal.current} / {goal.target} {goal.unit}
                                        </p>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{progress}% تکمیل شده</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};
