import React, { useState } from 'react';
import { Card, Button, Label, Input } from '../components/UI';
import { Dumbbell, Activity, BrainCircuit, Calculator, Utensils, Droplet, Scale, Timer, Percent } from 'lucide-react';
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

    // Heart Rate Zone Calculator State
    const [hrAge, setHrAge] = useState('');
    const [hrResting, setHrResting] = useState('');
    const [hrMax, setHrMax] = useState('');
    const [hrResult, setHrResult] = useState<{ maxHR: number; zones: { name: string; min: number; max: number; range: string }[] } | null>(null);

    const calculateHeartRateZones = () => {
        const age = parseFloat(hrAge);
        const resting = parseFloat(hrResting) || 70;
        const maxHR = parseFloat(hrMax) || (220 - age);

        if (age && maxHR > 0) {
            const zones = [
                { name: 'بازیابی', min: Math.round(maxHR * 0.50), max: Math.round(maxHR * 0.60), range: '50-60%' },
                { name: 'چربی سوزی', min: Math.round(maxHR * 0.60), max: Math.round(maxHR * 0.70), range: '60-70%' },
                { name: 'هوازی', min: Math.round(maxHR * 0.70), max: Math.round(maxHR * 0.80), range: '70-80%' },
                { name: 'آناروبیک', min: Math.round(maxHR * 0.80), max: Math.round(maxHR * 0.90), range: '80-90%' },
                { name: 'حداکثر', min: Math.round(maxHR * 0.90), max: Math.round(maxHR), range: '90-100%' }
            ];

            setHrResult({ maxHR: Math.round(maxHR), zones });
        }
    };

    // Recovery Time Calculator State
    const [recoveryIntensity, setRecoveryIntensity] = useState('5');
    const [recoveryDuration, setRecoveryDuration] = useState('');
    const [recoveryFitness, setRecoveryFitness] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [recoverySleep, setRecoverySleep] = useState<'poor' | 'average' | 'good'>('average');
    const [recoveryResult, setRecoveryResult] = useState<{ hours: number; days: number; recommendations: string[] } | null>(null);

    const calculateRecoveryTime = () => {
        const intensity = parseFloat(recoveryIntensity);
        const duration = parseFloat(recoveryDuration);

        if (intensity && duration) {
            let baseRecovery = (intensity * duration) / 10; // Base recovery in hours

            // Adjust for fitness level
            if (recoveryFitness === 'beginner') baseRecovery *= 1.3;
            else if (recoveryFitness === 'advanced') baseRecovery *= 0.8;

            // Adjust for sleep quality
            if (recoverySleep === 'poor') baseRecovery *= 1.4;
            else if (recoverySleep === 'good') baseRecovery *= 0.9;

            const hours = Math.max(24, Math.round(baseRecovery));
            const days = Math.ceil(hours / 24);

            const recommendations = [];
            if (days >= 3) recommendations.push('استراحت کامل برای ۲-۳ روز');
            if (recoverySleep === 'poor') recommendations.push('بهبود کیفیت خواب');
            if (intensity >= 8) recommendations.push('تمرینات سبک و هوازی');
            if (recoveryFitness === 'beginner') recommendations.push('افزایش تدریجی شدت تمرینات');

            setRecoveryResult({ hours, days, recommendations });
        }
    };

    // VO2 Max Calculator State
    const [vo2Method, setVo2Method] = useState<'rockport' | 'cooper'>('rockport');
    const [vo2Weight, setVo2Weight] = useState('');
    const [vo2Age, setVo2Age] = useState('');
    const [vo2Time, setVo2Time] = useState(''); // minutes for walk/run
    const [vo2HeartRate, setVo2HeartRate] = useState(''); // for Rockport test
    const [vo2Distance, setVo2Distance] = useState(''); // for Cooper test
    const [vo2Result, setVo2Result] = useState<{ vo2max: number; category: string; fitness: string } | null>(null);

    const calculateVO2Max = () => {
        const weight = parseFloat(vo2Weight);
        const age = parseFloat(vo2Age);

        if (weight && age) {
            let vo2max = 0;

            if (vo2Method === 'rockport') {
                const time = parseFloat(vo2Time); // minutes
                const hr = parseFloat(vo2HeartRate); // heart rate
                if (time && hr) {
                    // Rockport walking test formula
                    vo2max = 132.853 - (0.0769 * weight) - (0.3877 * age) + (6.315 * (1)) - (3.2649 * time) - (0.1565 * hr);
                }
            } else if (vo2Method === 'cooper') {
                const distance = parseFloat(vo2Distance); // meters
                if (distance) {
                    // Cooper 12-min run test formula
                    vo2max = (distance - 504.9) / 44.73;
                }
            }

            if (vo2max > 0) {
                vo2max = Math.round(vo2max * 10) / 10;

                let category = '';
                let fitness = '';

                if (vo2max < 25) { category = 'خیلی ضعیف'; fitness = 'نیاز به بهبود'; }
                else if (vo2max < 30) { category = 'ضعیف'; fitness = 'متوسط'; }
                else if (vo2max < 35) { category = 'متوسط'; fitness = 'خوب'; }
                else if (vo2max < 40) { category = 'خوب'; fitness = 'عالی'; }
                else { category = 'عالی'; fitness = 'ورزشکار حرفه‌ای'; }

                setVo2Result({ vo2max, category, fitness });
            }
        }
    };

    // Supplement Dosage Calculator State
    const [suppType, setSuppType] = useState<'protein' | 'creatine' | 'bcaas' | 'beta_alanine'>('protein');
    const [suppWeight, setSuppWeight] = useState('');
    const [suppGoal, setSuppGoal] = useState<'maintenance' | 'muscle_gain' | 'fat_loss'>('maintenance');
    const [suppResult, setSuppResult] = useState<{ daily: number; timing: string; notes: string[] } | null>(null);

    const calculateSupplementDosage = () => {
        const weight = parseFloat(suppWeight);

        if (weight) {
            let daily = 0;
            let timing = '';
            const notes = [];

            switch (suppType) {
                case 'protein':
                    if (suppGoal === 'muscle_gain') {
                        daily = weight * 2.2; // 2.2g per kg for muscle gain
                        timing = '۴-۶ وعده در روز';
                        notes.push('هر وعده ۲۰-۴۰ گرم پروتئین');
                        notes.push('ترکیب با کربوهیدرات برای جذب بهتر');
                    } else if (suppGoal === 'fat_loss') {
                        daily = weight * 1.6; // 1.6g per kg for fat loss
                        timing = '۳-۵ وعده در روز';
                        notes.push('هر وعده ۲۵-۳۵ گرم پروتئین');
                        notes.push('تمرکز روی پروتئین بدون چربی');
                    } else {
                        daily = weight * 1.2; // 1.2g per kg maintenance
                        timing = '۳-۴ وعده در روز';
                        notes.push('هر وعده ۲۰-۳۰ گرم پروتئین');
                    }
                    break;

                case 'creatine':
                    daily = 5; // 5g per day standard
                    timing = 'هر روز، ترجیحاً بعد از تمرین';
                    notes.push('۵ گرم در روز برای اشباع عضلات');
                    notes.push('می‌توان با آب یا آبمیوه مصرف کرد');
                    notes.push('برای نتیجه بهتر ۲۰ گرم در روز به مدت ۵-۷ روز');
                    break;

                case 'bcaas':
                    daily = weight * 0.3; // 0.3g per kg
                    timing = 'قبل، حین یا بعد از تمرین';
                    notes.push('نسبت ۲:۱:۱ (لوسین:ایزولوسین:والین)');
                    notes.push('برای کاهش خستگی عضلانی');
                    break;

                case 'beta_alanine':
                    daily = 5; // 5g per day
                    timing = 'با غذا برای کاهش سوزن سوزن شدن';
                    notes.push('ممکن است باعث سوزن سوزن شدن پوست شود');
                    notes.push('برای بهبود عملکرد هوازی و قدرتی');
                    break;
            }

            setSuppResult({ daily: Math.round(daily), timing, notes });
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
                </div>
            </div>

            {/* Utilities Tab */}
            <div className={activeTab === 'utils' ? 'block animate-fade-in' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <select value={waterActivity} onChange={(e) => setWaterActivity(e.target.value as any)} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600">
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
                                    <div className="text-xs text-gray-400 mt-1">≈ {Math.round(waterResult / 250) || 0} لیوان</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Heart Rate Zone Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="text-red-500" size={20} /> محاسبه مناطق ضربان قلب</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label className="text-xs">سن</Label><Input type="number" value={hrAge} onChange={e => setHrAge(e.target.value)} /></div>
                                <div><Label className="text-xs">ضربان استراحت</Label><Input type="number" value={hrResting} onChange={e => setHrResting(e.target.value)} placeholder="اختیاری" /></div>
                            </div>
                            <div>
                                <Label>ضربان حداکثر</Label>
                                <Input type="number" value={hrMax} onChange={e => setHrMax(e.target.value)} placeholder="اختیاری (محاسبه خودکار)" />
                            </div>
                            <Button onClick={calculateHeartRateZones} className="w-full bg-red-600 hover:bg-red-700">محاسبه</Button>
                            {hrResult && (
                                <div className="mt-4 space-y-2">
                                    <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="text-sm text-gray-500">ضربان حداکثر:</div>
                                        <div className="text-xl font-bold text-red-600 dark:text-red-400">{hrResult.maxHR} bpm</div>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {hrResult.zones.map((zone, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                                                <span className="font-semibold">{zone.name}</span>
                                                <span className="text-gray-600 dark:text-gray-400">{zone.min}-{zone.max} bpm ({zone.range})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Recovery Time Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Timer className="text-green-500" size={20} /> محاسبه زمان ریکاوری</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label className="text-xs">شدت تمرین (۱-۱۰)</Label><Input type="number" min="1" max="10" value={recoveryIntensity} onChange={e => setRecoveryIntensity(e.target.value)} /></div>
                                <div><Label className="text-xs">مدت (دقیقه)</Label><Input type="number" value={recoveryDuration} onChange={e => setRecoveryDuration(e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">سطح fitness</Label>
                                    <select value={recoveryFitness} onChange={(e) => setRecoveryFitness(e.target.value as any)} className="w-full p-2 rounded-lg border text-xs">
                                        <option value="beginner">مبتدی</option>
                                        <option value="intermediate">متوسط</option>
                                        <option value="advanced">پیشرفته</option>
                                    </select>
                                </div>
                                <div>
                                    <Label className="text-xs">کیفیت خواب</Label>
                                    <select value={recoverySleep} onChange={(e) => setRecoverySleep(e.target.value as any)} className="w-full p-2 rounded-lg border text-xs">
                                        <option value="poor">ضعیف</option>
                                        <option value="average">متوسط</option>
                                        <option value="good">خوب</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={calculateRecoveryTime} className="w-full bg-green-600 hover:bg-green-700">محاسبه</Button>
                            {recoveryResult && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl text-center">
                                    <div className="text-sm text-gray-500">زمان ریکاوری:</div>
                                    <div className="text-2xl font-black text-green-600 dark:text-green-400">{recoveryResult.hours} ساعت</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">≈ {recoveryResult.days} روز</div>
                                    {recoveryResult.recommendations.length > 0 && (
                                        <div className="mt-3 text-xs text-right">
                                            <div className="font-semibold mb-1">توصیه‌ها:</div>
                                            {recoveryResult.recommendations.map((rec, i) => (
                                                <div key={i} className="text-gray-600 dark:text-gray-400">• {rec}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* VO2 Max Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Activity className="text-blue-500" size={20} /> محاسبه VO2 Max</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>روش آزمون</Label>
                                <select value={vo2Method} onChange={(e) => setVo2Method(e.target.value as any)} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600">
                                    <option value="rockport">آزمون پیاده‌روی راکپورت</option>
                                    <option value="cooper">آزمون دو ۱۲ دقیقه‌ای کوپر</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label className="text-xs">وزن (kg)</Label><Input type="number" value={vo2Weight} onChange={e => setVo2Weight(e.target.value)} /></div>
                                <div><Label className="text-xs">سن</Label><Input type="number" value={vo2Age} onChange={e => setVo2Age(e.target.value)} /></div>
                            </div>
                            {vo2Method === 'rockport' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label className="text-xs">زمان (دقیقه)</Label><Input type="number" value={vo2Time} onChange={e => setVo2Time(e.target.value)} /></div>
                                    <div><Label className="text-xs">ضربان قلب</Label><Input type="number" value={vo2HeartRate} onChange={e => setVo2HeartRate(e.target.value)} /></div>
                                </div>
                            ) : (
                                <div>
                                    <Label>مسافت دویدن (متر)</Label>
                                    <Input type="number" value={vo2Distance} onChange={e => setVo2Distance(e.target.value)} />
                                </div>
                            )}
                            <Button onClick={calculateVO2Max} className="w-full bg-blue-600 hover:bg-blue-700">محاسبه</Button>
                            {vo2Result && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
                                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{vo2Result.vo2max} ml/kg/min</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{vo2Result.category}</div>
                                    <div className="text-xs text-gray-500 mt-1">سطح fitness: {vo2Result.fitness}</div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Supplement Dosage Calculator */}
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 md:col-span-2">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Utensils className="text-purple-500" size={20} /> محاسبه دوز مکمل‌ها</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>نوع مکمل</Label>
                                    <select value={suppType} onChange={(e) => setSuppType(e.target.value as any)} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600">
                                        <option value="protein">پروتئین</option>
                                        <option value="creatine">کراتین</option>
                                        <option value="bcaas">BCAA</option>
                                        <option value="beta_alanine">بتا آلانین</option>
                                    </select>
                                </div>
                                <div>
                                    <Label>وزن بدن (kg)</Label>
                                    <Input type="number" value={suppWeight} onChange={e => setSuppWeight(e.target.value)} />
                                </div>
                                <div>
                                    <Label>هدف</Label>
                                    <select value={suppGoal} onChange={(e) => setSuppGoal(e.target.value as any)} className="w-full p-2 rounded-xl border border-gray-200 bg-white dark:bg-dark-800 dark:border-dark-600">
                                        <option value="maintenance">حفظ وزن</option>
                                        <option value="muscle_gain">افزایش عضله</option>
                                        <option value="fat_loss">کاهش چربی</option>
                                    </select>
                                </div>
                            </div>
                            <Button onClick={calculateSupplementDosage} className="w-full bg-purple-600 hover:bg-purple-700">محاسبه</Button>
                            {suppResult && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-center">
                                        <div className="text-sm text-gray-500">دوز روزانه:</div>
                                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{suppResult.daily}g</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{suppResult.timing}</div>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                        <div className="text-sm font-semibold mb-2">نکات مهم:</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                            {suppResult.notes.map((note, i) => (
                                                <div key={i}>• {note}</div>
                                            ))}
                                        </div>
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
