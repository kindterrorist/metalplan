import React, { useState, useMemo } from 'react';
import { Card, Button } from '../../components/UI';
import { Camera, Image as ImageIcon } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAthleteContext } from './AthleteContext';
import { calculateBodyComposition } from '../../utils/helpers';
import { Measurement } from '../../types';
import { formatJalaliChartLabel, formatJalaliFull } from '../../src/utils/jalali';

interface Props {
    isDarkMode: boolean;
    setIsAddMeasurementOpen: (open: boolean) => void;
}

export const AnalyticsTab: React.FC<Props> = ({ isDarkMode, setIsAddMeasurementOpen }) => {
    const { athlete } = useAthleteContext();
    const [compareDate1, setCompareDate1] = useState<string>('');
    const [compareDate2, setCompareDate2] = useState<string>('');
    const [compareAngle, setCompareAngle] = useState<'front' | 'side' | 'back'>('front');
    const [circumferenceMetric, setCircumferenceMetric] = useState<string>('waist');

    const multiMetricChartData = useMemo(() => {
        return athlete.measurements
            .slice(-10)
            .map(m => ({
                date: formatJalaliChartLabel(m.date),
                weight: m.weight,
                bodyFat: m.bodyFat || null,
                waist: m.waist || null
            }));
    }, [athlete.measurements]);

    const radarData = useMemo(() => {
        if (!athlete.measurements.length) return [];
        const sorted = [...athlete.measurements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    }, [athlete.measurements]);

    const trendData = useMemo(() => {
        return athlete.measurements
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(m => ({
                date: formatJalaliChartLabel(m.date),
                value: m[circumferenceMetric as keyof Measurement] || 0
            }));
    }, [athlete.measurements, circumferenceMetric]);

    const latestMeasurement = athlete.measurements[athlete.measurements.length - 1];
    const bodyComp = useMemo(() =>
        calculateBodyComposition(latestMeasurement?.weight || 0, latestMeasurement?.bodyFat),
        [latestMeasurement]
    );

    const bodyCompData = latestMeasurement?.bodyFat ? [
        { name: 'توده عضلانی', value: bodyComp.leanMass, color: '#10b981' },
        { name: 'توده چربی', value: bodyComp.fatMass, color: '#f59e0b' }
    ] : [];

    return (
        <div className="space-y-6">
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

            <Card className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <Camera className="text-purple-600" />
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">گالری پیشرفت بدنی</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                        {(['front', 'side', 'back'] as const).map(angle => (
                            <button
                                key={angle}
                                onClick={() => setCompareAngle(angle)}
                                className={`px-3 py-1 rounded-lg transition-colors ${compareAngle === angle ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-dark-700 dark:text-gray-400'}`}
                            >
                                {angle === 'front' ? 'روبرو' : angle === 'side' ? 'نیم‌رخ' : 'پشت'}
                            </button>
                        ))}
                    </div>
                </div>

                {athlete.measurements.some(m => m.photos) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <select
                                value={compareDate1}
                                onChange={(e) => setCompareDate1(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm"
                            >
                                <option value="">انتخاب تاریخ اول...</option>
                                {athlete.measurements
                                    .filter(m => m.photos && m.photos[compareAngle])
                                    .map((m, idx) => (
                                        <option key={idx} value={m.date}>
                                            {formatJalaliFull(m.date)} - (وزن: {m.weight})
                                        </option>
                                    ))
                                }
                            </select>
                            <div className="aspect-[3/4] bg-gray-100 dark:bg-dark-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-700">
                                {compareDate1 ? (
                                    <img
                                        src={athlete.measurements.find(m => m.date === compareDate1)?.photos?.[compareAngle]}
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

                        <div className="space-y-3">
                            <select
                                value={compareDate2}
                                onChange={(e) => setCompareDate2(e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-sm"
                            >
                                <option value="">انتخاب تاریخ دوم...</option>
                                {athlete.measurements
                                    .filter(m => m.photos && m.photos[compareAngle])
                                    .map((m, idx) => (
                                        <option key={idx} value={m.date}>
                                            {formatJalaliFull(m.date)} - (وزن: {m.weight})
                                        </option>
                                    ))
                                }
                            </select>
                            <div className="aspect-[3/4] bg-gray-100 dark:bg-dark-800 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-dark-700">
                                {compareDate2 ? (
                                    <img
                                        src={athlete.measurements.find(m => m.date === compareDate2)?.photos?.[compareAngle]}
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
                        <p className="text-gray-500 dark:text-gray-400">هنوز عکس بدنی ثبت نشده است</p>
                        <Button variant="secondary" className="mt-4" onClick={() => setIsAddMeasurementOpen(true)}>
                            ثبت اولین عکس
                        </Button>
                    </div>
                )}
            </Card>

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
    );
};
