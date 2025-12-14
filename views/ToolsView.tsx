import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Label, Input } from '../components/UI';
import { Dumbbell, Activity, BrainCircuit, Calculator, Utensils, Droplet, Beef, Scale, Timer, Percent } from 'lucide-react';
import { generatePlanSuggestion } from '../services/geminiService';

interface ToolsViewProps {
    apiKey: string;
    handleApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
    apiKey,
    handleApiKeyChange,
    addToast
}) => {
    // 1RM Calculator State
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [oneRM, setOneRM] = useState<number | null>(null);

    const calculate1RM = () => {
        const w = parseFloat(weight);
        const r = parseFloat(reps);
        if (w && r) {
            // Epley formula
            const rm = w * (1 + r / 30);
            setOneRM(Math.round(rm));
        }
    };

    // BMI Calculator State
    const [bmiHeight, setBmiHeight] = useState('');
    const [bmiWeight, setBmiWeight] = useState('');
    const [bmiResult, setBmiResult] = useState<number | null>(null);

    const calculateBMI = () => {
        const h = parseFloat(bmiHeight) / 100; // cm to m
        const w = parseFloat(bmiWeight);
        if (h && w) {
            const bmi = w / (h * h);
            setBmiResult(parseFloat(bmi.toFixed(1)));
        }
    };

    // TDEE & Macro Calculator State
    const [tdeeAge, setTdeeAge] = useState('');
    const [tdeeGender, setTdeeGender] = useState<'male' | 'female'>('male');
    const [tdeeHeight, setTdeeHeight] = useState('');
    const [tdeeWeight, setTdeeWeight] = useState('');
    const [tdeeActivity, setTdeeActivity] = useState('1.2');
    const [tdeeGoal, setTdeeGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain');
    const [tdeeResult, setTdeeResult] = useState<{ bmr: number; tdee: number; calories: number; protein: number; carbs: number; fats: number } | null>(null);

    const calculateTDEE = () => {
        const age = parseFloat(tdeeAge);
        const height = parseFloat(tdeeHeight);
        const weight = parseFloat(tdeeWeight);
        const activity = parseFloat(tdeeActivity);

        if (age && height && weight) {
            // Mifflin-St Jeor Equation
            let bmr = 10 * weight + 6.25 * height - 5 * age;
            bmr += tdeeGender === 'male' ? 5 : -161;

            const tdee = bmr * activity;

            // Adjust for goal
            let targetCalories = tdee;
            if (tdeeGoal === 'cut') targetCalories -= 500;
            if (tdeeGoal === 'bulk') targetCalories += 300;

            // Macros (40/30/30 ratio as baseline)
            const protein = Math.round((targetCalories * 0.30) / 4);
            const carbs = Math.round((targetCalories * 0.40) / 4);
            const fats = Math.round((targetCalories * 0.30) / 9);

            setTdeeResult({
                bmr: Math.round(bmr),
                tdee: Math.round(tdee),
                calories: Math.round(targetCalories),
                protein,
                carbs,
                fats
            });
        }
    };

    // Plate Calculator State
    const [plateTarget, setPlateTarget] = useState('');
    const [barWeight, setBarWeight] = useState('20');
    const [plateResult, setPlateResult] = useState<{ perSide: number; plates: { weight: number; count: number }[] } | null>(null);

    const calculatePlates = () => {
        const target = parseFloat(plateTarget);
        const bar = parseFloat(barWeight);

        if (target && bar && target >= bar) {
            const perSide = (target - bar) / 2;
            const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];
            let remaining = perSide;
            const plates: { weight: number; count: number }[] = [];

            for (const plate of availablePlates) {
                const count = Math.floor(remaining / plate);
                if (count > 0) {
                    plates.push({ weight: plate, count });
                    remaining -= count * plate;
                }
            }

            setPlateResult({ perSide: Math.round(perSide * 100) / 100, plates });
        }
    };

    // Percentage Load Calculator State
    const [pct1RM, setPct1RM] = useState('');
    const [pctResult, setPctResult] = useState<{ [key: number]: number } | null>(null);

    const calculatePercentages = () => {
        const rm = parseFloat(pct1RM);
        if (rm) {
            const percentages = [50, 60, 65, 70, 75, 80, 85, 90, 95, 100];
            const result: { [key: number]: number } = {};
            percentages.forEach(pct => {
                result[pct] = Math.round((rm * pct) / 100);
            });
            setPctResult(result);
        }
    };

    // Body Fat Calculator State
    const [bfGender, setBfGender] = useState<'male' | 'female'>('male');
    const [bfWeight, setBfWeight] = useState('');
    const [bfNeck, setBfNeck] = useState('');
    const [bfWaist, setBfWaist] = useState('');
    const [bfHip, setBfHip] = useState('');
    const [bfHeight, setBfHeight] = useState('');
    const [bfResult, setBfResult] = useState<{ percentage: number; category: string } | null>(null);

    const calculateBodyFat = () => {
        const weight = parseFloat(bfWeight);
        const neck = parseFloat(bfNeck);
        const waist = parseFloat(bfWaist);
        const hip = parseFloat(bfHip);
        const height = parseFloat(bfHeight);

        if (neck && waist && height) {
            let bodyFat = 0;
            // Navy Method
            if (bfGender === 'male') {
                bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
            } else {
                if (hip) {
                    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
                }
            }

            const percentage = Math.round(bodyFat * 10) / 10;
            let category = '';
            if (bfGender === 'male') {
                if (percentage < 6) category = 'ضروری';
                else if (percentage < 14) category = 'ورزشکار';
                else if (percentage < 18) category = 'تناسب اندام';
                else if (percentage < 25) category = 'متوسط';
                else category = 'چاق';
            } else {
                if (percentage < 14) category = 'ضروری';
                else if (percentage < 21) category = 'ورزشکار';
                else if (percentage < 25) category = 'تناسب اندام';
                else if (percentage < 32) category = 'متوسط';
                else category = 'چاق';
            }

            setBfResult({ percentage, category });
        }
    };

    // Rest Timer State
    const [restTime, setRestTime] = useState(60);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timerRunning && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0) {
            setTimerRunning(false);
            addToast('زمان استراحت تمام شد!', 'آماده برای ست بعدی', 'success');
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timerRunning, timeLeft]);

    const startTimer = () => {
        setTimeLeft(restTime);
        setTimerRunning(true);
    };

    const stopTimer = () => {
        setTimerRunning(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const resetTimer = () => {
        setTimerRunning(false);
        setTimeLeft(restTime);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    // Lean Body Mass Calculator State
    const [lbmWeight, setLbmWeight] = useState('');
    const [lbmBodyFat, setLbmBodyFat] = useState('');
    const [lbmResult, setLbmResult] = useState<{ lbm: number; fatMass: number } | null>(null);

    const calculateLBM = () => {
        const weight = parseFloat(lbmWeight);
        const bf = parseFloat(lbmBodyFat);
        if (weight && bf) {
            const fatMass = (weight * bf) / 100;
            const lbm = weight - fatMass;
            setLbmResult({ lbm: Math.round(lbm * 10) / 10, fatMass: Math.round(fatMass * 10) / 10 });
        }
    };

    // Water Intake Calculator State
    const [waterWeight, setWaterWeight] = useState('');
    const [waterActivity, setWaterActivity] = useState<'low' | 'moderate' | 'high'>('moderate');
    const [waterResult, setWaterResult] = useState<number | null>(null);

    const calculateWater = () => {
        const weight = parseFloat(waterWeight);
        if (weight) {
            let baseWater = weight * 35; // ml per kg
            if (waterActivity === 'moderate') baseWater *= 1.2;
            if (waterActivity === 'high') baseWater *= 1.5;
            setWaterResult(Math.round(baseWater));
        }
    };

    // Protein per Meal Calculator State
    const [proteinDaily, setProteinDaily] = useState('');
    const [proteinMeals, setProteinMeals] = useState('4');
    const [proteinResult, setProteinResult] = useState<{ perMeal: number; minPerMeal: number } | null>(null);

    const calculateProteinPerMeal = () => {
        const daily = parseFloat(proteinDaily);
        const meals = parseFloat(proteinMeals);
        if (daily && meals) {
            const perMeal = daily / meals;
            const minPerMeal = 25; // minimum leucine threshold
            setProteinResult({ perMeal: Math.round(perMeal), minPerMeal });
        }
    };

    // AI Plan Generator
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState('');

    const handleAiGenerate = async () => {
        if (!apiKey) { addToast('کلید API تنظیم نشده است', 'لطفا ابتدا در تنظیمات کلید را وارد کنید', 'error'); return; }
        setAiLoading(true);
        try {
            const res = await generatePlanSuggestion(aiPrompt, 'تناسب اندام', apiKey);
            setAiResult(res);
        } catch (e) {
            addToast('خطا', 'مشکلی در ارتباط با هوش مصنوعی پیش آمد', 'error');
        } finally {
            setAiLoading(false);
        }
    };

    // Tab State
    const [activeTab, setActiveTab] = useState<'ai' | 'strength' | 'body' | 'utils'>('ai');

    const tabs = [
        { id: 'ai', label: 'مربی هوشمند', icon: BrainCircuit, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'strength', label: 'قدرتی', icon: Dumbbell, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'body', label: 'بدن و تغذیه', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 'utils', label: 'ابزارها', icon: Timer, color: 'text-violet-600', bg: 'bg-violet-50' },
    ];

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">ابزارها</h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 font-bold whitespace-nowrap ${isActive
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-white dark:text-gray-900 dark:shadow-none scale-105'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-dark-800 dark:text-gray-400 dark:hover:bg-dark-700'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-current' : tab.color} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* AI Planner Tab */}
            <div className={activeTab === 'ai' ? 'block animate-fade-in' : 'hidden'}>
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-900/30">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-800 dark:text-indigo-300"><BrainCircuit /> دستیار هوشمند مربی (Gemini AI)</h3>
                    {!apiKey ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500 mb-4">برای استفاده از هوش مصنوعی، کلید API را وارد کنید.</p>
                            <Input placeholder="API Key" type="password" value={apiKey} onChange={handleApiKeyChange} className="max-w-xs mx-auto text-center" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Label>توضیحات ورزشکار و هدف (مثلا: مرد ۳۰ ساله، مبتدی، هدف کاهش وزن)</Label>
                            <textarea
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 min-h-[100px] bg-white dark:bg-dark-800 dark:border-dark-600"
                                placeholder="توضیحات را بنویسید..."
                            />
                            <Button onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                {aiLoading ? 'در حال تفکر...' : 'پیشنهاد برنامه'}
                            </Button>
                            {aiResult && (
                                <div className="mt-6 p-4 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 whitespace-pre-wrap leading-relaxed text-sm">
                                    {aiResult}
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            {/* Strength Tab */}
            <div className={activeTab === 'strength' ? 'block animate-fade-in' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 1RM Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Dumbbell className="text-blue-500" size={20} /> محاسبه گر 1RM</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>وزنه (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                                <div><Label>تکرار</Label><Input type="number" value={reps} onChange={e => setReps(e.target.value)} /></div>
                            </div>
                            <Button onClick={calculate1RM} className="w-full bg-blue-600 hover:bg-blue-700">محاسبه</Button>
                            {oneRM && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
                                    <div className="text-sm text-gray-500">1RM شما:</div>
                                    <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{oneRM} kg</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Percentage Load Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Percent className="text-purple-500" size={20} /> محاسبه درصد بار</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>1RM شما (kg)</Label>
                                <Input type="number" value={pct1RM} onChange={e => setPct1RM(e.target.value)} />
                            </div>
                            <Button onClick={calculatePercentages} className="w-full bg-purple-600 hover:bg-purple-700">محاسبه</Button>
                            {pctResult && (
                                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                                    {Object.entries(pctResult).map(([pct, weight]) => (
                                        <div key={pct} className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
                                            <span className="font-semibold">{pct}%</span>
                                            <span className="text-purple-600 dark:text-purple-400 font-bold">{weight} kg</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Plate Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calculator className="text-orange-500" size={20} /> محاسبه دیسک</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>وزن هدف (kg)</Label>
                                <Input type="number" value={plateTarget} onChange={e => setPlateTarget(e.target.value)} />
                            </div>
                            <div>
                                <Label>وزن هالتر (kg)</Label>
                                <Input type="number" value={barWeight} onChange={e => setBarWeight(e.target.value)} />
                            </div>
                            <Button onClick={calculatePlates} className="w-full bg-orange-600 hover:bg-orange-700">محاسبه</Button>
                            {plateResult && (
                                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">هر طرف: <span className="font-bold text-orange-600 dark:text-orange-400">{plateResult.perSide} kg</span></div>
                                    <div className="space-y-1">
                                        {plateResult.plates.map((p, i) => (
                                            <div key={i} className="text-sm flex justify-between">
                                                <span>{p.weight} kg</span>
                                                <span className="font-semibold">× {p.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Body & Nutrition Tab */}
            <div className={activeTab === 'body' ? 'block animate-fade-in' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* TDEE & Macro Calculator - Full Width on Mobile, 2 cols on Desktop */}
                    <Card className="p-6 md:col-span-2 lg:col-span-3 hover:shadow-lg transition-shadow duration-300 border-amber-100 dark:border-amber-900/20">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-amber-900 dark:text-amber-100"><Utensils className="text-amber-500" size={20} /> محاسبه کالری و ماکرو (TDEE)</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><Label>سن</Label><Input type="number" value={tdeeAge} onChange={e => setTdeeAge(e.target.value)} /></div>
                                <div><Label>قد (cm)</Label><Input type="number" value={tdeeHeight} onChange={e => setTdeeHeight(e.target.value)} /></div>
                                <div><Label>وزن (kg)</Label><Input type="number" value={tdeeWeight} onChange={e => setTdeeWeight(e.target.value)} /></div>
                                <div>
                                    <Label>جنسیت</Label>
                                    <select value={tdeeGender} onChange={e => setTdeeGender(e.target.value as 'male' | 'female')} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600 outline-none focus:ring-2 focus:ring-amber-500">
                                        <option value="male">مرد</option>
                                        <option value="female">زن</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>سطح فعالیت</Label>
                                    <select value={tdeeActivity} onChange={e => setTdeeActivity(e.target.value)} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600 outline-none focus:ring-2 focus:ring-amber-500">
                                        <option value="1.2">کم تحرک</option>
                                        <option value="1.375">فعالیت خفیف (1-3 روز)</option>
                                        <option value="1.55">فعالیت متوسط (3-5 روز)</option>
                                        <option value="1.725">فعالیت زیاد (6-7 روز)</option>
                                        <option value="1.9">فعالیت بسیار زیاد</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>هدف</Label>
                                    <select value={tdeeGoal} onChange={e => setTdeeGoal(e.target.value as 'cut' | 'maintain' | 'bulk')} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600 outline-none focus:ring-2 focus:ring-amber-500">
                                        <option value="cut">کاهش وزن</option>
                                        <option value="maintain">حفظ وزن</option>
                                        <option value="bulk">افزایش وزن</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={calculateTDEE} className="w-full bg-amber-600 hover:bg-amber-700">محاسبه</Button>
                            {tdeeResult && (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-center">
                                        <div className="text-xs text-gray-500">BMR</div>
                                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">{tdeeResult.bmr}</div>
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-center">
                                        <div className="text-xs text-gray-500">TDEE</div>
                                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">{tdeeResult.tdee}</div>
                                    </div>
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-center">
                                        <div className="text-xs text-gray-500">کالری هدف</div>
                                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">{tdeeResult.calories}</div>
                                    </div>
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center col-span-2 md:col-span-1">
                                        <div className="text-xs text-gray-500">پروتئین</div>
                                        <div className="text-xl font-black text-blue-600 dark:text-blue-400">{tdeeResult.protein}g</div>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
                                        <div className="text-xs text-gray-500">کربوهیدرات</div>
                                        <div className="text-xl font-black text-green-600 dark:text-green-400">{tdeeResult.carbs}g</div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl text-center md:col-start-2">
                                        <div className="text-xs text-gray-500">چربی</div>
                                        <div className="text-xl font-black text-yellow-600 dark:text-yellow-400">{tdeeResult.fats}g</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* BMI Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="text-emerald-500" size={20} /> شاخص توده بدنی (BMI)</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>قد (cm)</Label><Input type="number" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} /></div>
                                <div><Label>وزن (kg)</Label><Input type="number" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} /></div>
                            </div>
                            <Button onClick={calculateBMI} variant="secondary" className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">محاسبه</Button>
                            {bmiResult && (
                                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-center">
                                    <div className="text-sm text-gray-500">BMI شما:</div>
                                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{bmiResult}</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Body Fat Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Scale className="text-rose-500" size={20} /> درصد چربی بدن</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button onClick={() => setBfGender('male')} variant={bfGender === 'male' ? 'primary' : 'secondary'} className="flex-1 text-sm">مرد</Button>
                                <Button onClick={() => setBfGender('female')} variant={bfGender === 'female' ? 'primary' : 'secondary'} className="flex-1 text-sm">زن</Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label className="text-xs">وزن (kg)</Label><Input type="number" value={bfWeight} onChange={e => setBfWeight(e.target.value)} /></div>
                                <div><Label className="text-xs">قد (cm)</Label><Input type="number" value={bfHeight} onChange={e => setBfHeight(e.target.value)} /></div>
                                <div><Label className="text-xs">گردن (cm)</Label><Input type="number" value={bfNeck} onChange={e => setBfNeck(e.target.value)} /></div>
                                <div><Label className="text-xs">کمر (cm)</Label><Input type="number" value={bfWaist} onChange={e => setBfWaist(e.target.value)} /></div>
                                {bfGender === 'female' && <div className="col-span-2"><Label className="text-xs">باسن (cm)</Label><Input type="number" value={bfHip} onChange={e => setBfHip(e.target.value)} /></div>}
                            </div>
                            <Button onClick={calculateBodyFat} className="w-full bg-rose-600 hover:bg-rose-700">محاسبه</Button>
                            {bfResult && (
                                <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-center">
                                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{bfResult.percentage}%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{bfResult.category}</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Lean Body Mass Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="text-teal-500" size={20} /> توده عضلانی (LBM)</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>وزن (kg)</Label>
                                <Input type="number" value={lbmWeight} onChange={e => setLbmWeight(e.target.value)} />
                            </div>
                            <div>
                                <Label>درصد چربی (%)</Label>
                                <Input type="number" value={lbmBodyFat} onChange={e => setLbmBodyFat(e.target.value)} />
                            </div>
                            <Button onClick={calculateLBM} className="w-full bg-teal-600 hover:bg-teal-700">محاسبه</Button>
                            {lbmResult && (
                                <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">توده عضلانی:</span>
                                        <span className="text-xl font-bold text-teal-600 dark:text-teal-400">{lbmResult.lbm} kg</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">توده چربی:</span>
                                        <span className="text-xl font-bold text-gray-500">{lbmResult.fatMass} kg</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Utilities Tab */}
            <div className={activeTab === 'utils' ? 'block animate-fade-in' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Rest Timer */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Timer className="text-violet-500" size={20} /> تایمر استراحت</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>زمان استراحت (ثانیه)</Label>
                                <Input type="number" value={restTime} onChange={e => setRestTime(parseInt(e.target.value) || 60)} disabled={timerRunning} />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <Button onClick={() => { setRestTime(30); setTimeLeft(30); }} variant="secondary" className="text-xs" disabled={timerRunning}>30s</Button>
                                <Button onClick={() => { setRestTime(60); setTimeLeft(60); }} variant="secondary" className="text-xs" disabled={timerRunning}>60s</Button>
                                <Button onClick={() => { setRestTime(90); setTimeLeft(90); }} variant="secondary" className="text-xs" disabled={timerRunning}>90s</Button>
                                <Button onClick={() => { setRestTime(120); setTimeLeft(120); }} variant="secondary" className="text-xs" disabled={timerRunning}>2m</Button>
                                <Button onClick={() => { setRestTime(180); setTimeLeft(180); }} variant="secondary" className="text-xs" disabled={timerRunning}>3m</Button>
                                <Button onClick={() => { setRestTime(300); setTimeLeft(300); }} variant="secondary" className="text-xs" disabled={timerRunning}>5m</Button>
                            </div>
                            <div className="p-6 bg-violet-50 dark:bg-violet-900/20 rounded-2xl text-center">
                                <div className="text-5xl font-black text-violet-600 dark:text-violet-400 font-mono tracking-wider">
                                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <Button onClick={startTimer} disabled={timerRunning} className="bg-green-600 hover:bg-green-700">شروع</Button>
                                <Button onClick={stopTimer} disabled={!timerRunning} className="bg-red-600 hover:bg-red-700">توقف</Button>
                                <Button onClick={resetTimer} variant="secondary">ریست</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Water Intake Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Droplet className="text-cyan-500" size={20} /> محاسبه آب بدن</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>وزن (kg)</Label>
                                <Input type="number" value={waterWeight} onChange={e => setWaterWeight(e.target.value)} />
                            </div>
                            <div>
                                <Label>سطح فعالیت</Label>
                                <select value={waterActivity} onChange={e => setWaterActivity(e.target.value as 'low' | 'moderate' | 'high')} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600">
                                    <option value="low">کم</option>
                                    <option value="moderate">متوسط</option>
                                    <option value="high">زیاد</option>
                                </select>
                            </div>
                            <Button onClick={calculateWater} className="w-full bg-cyan-600 hover:bg-cyan-700">محاسبه</Button>
                            {waterResult && (
                                <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl text-center">
                                    <div className="text-sm text-gray-500">آب روزانه:</div>
                                    <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">{waterResult} ml</div>
                                    <div className="text-xs text-gray-400 mt-1">≈ {Math.round(waterResult / 250)} لیوان</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Protein per Meal Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Beef className="text-red-500" size={20} /> پروتئین هر وعده</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>پروتئین روزانه (g)</Label>
                                <Input type="number" value={proteinDaily} onChange={e => setProteinDaily(e.target.value)} />
                            </div>
                            <div>
                                <Label>تعداد وعده</Label>
                                <Input type="number" value={proteinMeals} onChange={e => setProteinMeals(e.target.value)} />
                            </div>
                            <Button onClick={calculateProteinPerMeal} className="w-full bg-red-600 hover:bg-red-700">محاسبه</Button>
                            {proteinResult && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                    <div className="text-center mb-3">
                                        <div className="text-sm text-gray-500">پروتئین هر وعده:</div>
                                        <div className="text-3xl font-black text-red-600 dark:text-red-400">{proteinResult.perMeal}g</div>
                                    </div>
                                    <div className="text-xs text-gray-500 text-center border-t pt-2">
                                        توصیه: حداقل {proteinResult.minPerMeal}g در هر وعده
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
