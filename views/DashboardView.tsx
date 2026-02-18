import React from 'react';
import { Athlete, WorkoutPlan, TrainerProfile, View } from '../types';
import { Card, Skeleton } from '../components/UI';
import { Users, FileText, Dumbbell, Calendar, UserPlus, Calculator, Utensils, Activity, User, History, Check, AlertCircle, ChevronLeft, Sun, Sunrise, SunDim, MoonStar, Search, Trophy, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface DashboardViewProps {
    athletes: Athlete[];
    plans: WorkoutPlan[];
    exercises: any[];
    trainerProfile: TrainerProfile | null;
    isLoading: boolean;
    isDarkMode: boolean;
    setCurrentView: (view: View) => void;
    setSelectedAthlete: (athlete: Athlete | null) => void;
    setEditingAthlete: (athlete: Athlete | null) => void;
    setIsAthleteModalOpen: (open: boolean) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
    athletes,
    plans,
    exercises,
    trainerProfile,
    isLoading,
    isDarkMode,
    setCurrentView,
    setSelectedAthlete,
    setEditingAthlete,
    setIsAthleteModalOpen
}) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    if (isLoading) {
        return (
            <div className="space-y-6 pb-20">
                <div className="flex justify-between items-center mb-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-14 w-14 rounded-2xl" /></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}</div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div>
                    <div className="space-y-6"><Skeleton className="h-40 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div>
                </div>
            </div>
        );
    }

    // --- Search Logic ---
    const filteredAthletes = athletes.filter(a => a.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

    // --- Stats Logic ---
    const monthlyJoiners = athletes.filter(a => {
        const d = new Date(a.joinDate);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const recentActivities = [
        ...athletes.map(a => ({
            type: 'athlete' as const,
            date: new Date(a.joinDate).getTime(),
            id: a.id,
            title: `ثبت نام ورزشکار جدید: ${a.fullName}`,
            meta: `${a.age} ساله، هدف: ${a.currentGoal || 'نامشخص'}`
        })),
        ...plans.map(p => ({
            type: 'plan' as const,
            date: p.created_at || 0,
            id: p.id,
            title: `طراحی برنامه جدید: ${p.name}`,
            meta: `برای ${athletes.find(a => a.id === p.athleteId)?.fullName || 'ورزشکار'}`
        })),
        // Add completion logs if available
        ...athletes.flatMap(a => (a.workoutLog || []).filter(log => log.completed).map(log => ({
            type: 'workout' as const,
            date: new Date(log.date).getTime(),
            id: log.id,
            title: `تکمیل تمرین توسط ${a.fullName}`,
            meta: 'یک جلسه تمرینی با موفقیت انجام شد'
        })))
    ].sort((a, b) => b.date - a.date).slice(0, 10); // Show top 10

    const goalStats = athletes.reduce((acc, curr) => {
        const g = curr.currentGoal || 'سایر';
        acc[g] = (acc[g] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const goalChartData = Object.keys(goalStats).map(k => ({ name: k, value: goalStats[k] }));
    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const warningAthletes = athletes.filter(a => {
        if (!a.measurements || a.measurements.length === 0) return false;
        const lastDate = new Date(a.measurements[a.measurements.length - 1].date);
        const diffTime = Math.abs(Date.now() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 30;
    }).slice(0, 3);

    // Consistency Champions (Top Performers)
    const topPerformers = athletes
        .map(a => ({
            ...a,
            completedWorkouts: a.workoutLog?.filter(l => l.completed).length || 0
        }))
        .sort((a, b) => b.completedWorkouts - a.completedWorkouts)
        .slice(0, 3)
        .filter(a => a.completedWorkouts > 0);


    // Time based greeting
    const hour = new Date().getHours();
    let greeting = 'روز بخیر';
    let GreetingIcon = Sun;
    if (hour < 12) { greeting = 'صبح بخیر'; GreetingIcon = Sunrise; }
    else if (hour < 18) { greeting = 'عصر بخیر'; GreetingIcon = SunDim; }
    else { greeting = 'شب بخیر'; GreetingIcon = MoonStar; }

    return (
        <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        {greeting}، <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{trainerProfile?.name || 'مربی عزیز'}</span> <GreetingIcon className="text-amber-500 hidden md:block animate-pulse-slow" size={32} />
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-base">
                        خلاصه فعالیت‌های باشگاه شما در {new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-auto min-w-[300px] group">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="جستجوی ورزشکار..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white dark:bg-dark-800 border-2 border-gray-100 dark:border-dark-700 rounded-2xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-900/10 transition-all outline-none text-gray-700 dark:text-gray-200 font-medium shadow-sm hover:border-gray-200 dark:hover:border-dark-600"
                    />
                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {filteredAthletes.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                    {filteredAthletes.map(a => (
                                        <div key={a.id} onClick={() => { setSelectedAthlete(a); setCurrentView('athletes'); setSearchQuery(''); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-700 rounded-xl cursor-pointer transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">{a.fullName.charAt(0)}</div>
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{a.fullName}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm">نتیجه‌ای یافت نشد</div>
                            )}
                        </div>
                    )}
                </div>

                {trainerProfile?.logoUrl && (
                    <img src={trainerProfile.logoUrl} alt="Logo" className="hidden md:block w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-dark-700 hover:scale-105 transition-transform" />
                )}
            </header>

            {/* Stats Grid - Modernized with Glassmorphism */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { title: 'کل ورزشکاران', value: athletes.length, icon: Users, color: 'blue', delay: '0' },
                    { title: 'برنامه‌های فعال', value: plans.length, icon: FileText, color: 'emerald', delay: '100' },
                    { title: 'بانک حرکات', value: exercises.length, icon: Dumbbell, color: 'purple', delay: '200' },
                    { title: 'ورودی ماه جاری', value: monthlyJoiners, icon: UserPlus, color: 'orange', delay: '300' }
                ].map((stat, idx) => (
                    <div key={idx} className={`bg-white dark:bg-dark-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-dark-700 relative overflow-hidden group hover:shadow-lg transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${stat.delay}ms` }}>
                        <div className={`absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:opacity-15 dark:group-hover:opacity-25 transition-opacity`}>
                            <stat.icon size={80} className={`text-${stat.color}-600 dark:text-${stat.color}-400 transform -rotate-12 translate-x-4 -translate-y-4`} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/30 text-${stat.color}-600 dark:text-${stat.color}-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm dark:shadow-none`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-3xl font-black text-gray-800 dark:text-white mb-1 tracking-tight">{stat.value}</div>
                            <div className="text-sm font-bold text-gray-500 dark:text-gray-400">{stat.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-6 md:space-y-8">
                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => { setSelectedAthlete(null); setEditingAthlete(null); setIsAthleteModalOpen(true); }} className="bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white p-4 rounded-3xl shadow-lg shadow-primary-200 dark:shadow-none flex flex-col items-center justify-center gap-2.5 group transition-all active:scale-95 border border-transparent hover:-translate-y-0.5">
                            <div className="bg-white/20 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform backdrop-blur-sm"><UserPlus size={26} /></div>
                            <span className="font-bold text-sm">شاگرد جدید</span>
                        </button>
                        <button onClick={() => setCurrentView('exercises')} className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 hover:border-indigo-200 dark:hover:border-indigo-800 p-4 rounded-3xl shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2.5 group transition-all active:scale-95 hover:-translate-y-0.5">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform"><Dumbbell size={26} /></div>
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">بانک حرکات</span>
                        </button>
                        <button onClick={() => setCurrentView('settings')} className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 hover:border-emerald-200 dark:hover:border-emerald-800 p-4 rounded-3xl shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2.5 group transition-all active:scale-95 hover:-translate-y-0.5">
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform"><Settings size={26} /></div>
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">تنظیمات</span>
                        </button>
                        <button onClick={() => setCurrentView('tools')} className="bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 hover:border-purple-200 dark:hover:border-purple-800 p-4 rounded-3xl shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2.5 group transition-all active:scale-95 hover:-translate-y-0.5">
                            <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform"><Calculator size={26} /></div>
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-200">ابزارها</span>
                        </button>
                    </div>

                    {/* Charts & Activity Split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Goal Distribution Chart */}
                        <Card variant="glass" className="p-6 flex flex-col justify-between min-h-[400px] relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                            <div className="relative z-10 w-full">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">اهداف ورزشکاران</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">توزیع آماری بر اساس هدف تمرینی</p>
                            </div>
                            <div className="h-[240px] w-full relative z-10 my-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={goalChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" cornerRadius={8} stroke="none">
                                            {goalChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', fontFamily: 'Vazirmatn', backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#fff' : '#000', padding: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <span className="font-black text-5xl text-gray-800 dark:text-white tracking-tighter">{athletes.length}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">نفر کل</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center relative z-10">
                                {goalChartData.slice(0, 4).map((entry, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-dark-700/50 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-dark-600">
                                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                                        {entry.name || 'نامشخص'}
                                    </div>
                                ))}
                            </div>
                            {/* Decorative BG */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100 dark:bg-primary-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none opacity-50"></div>
                        </Card>

                        {/* Activity Feed */}
                        <Card variant="glass" className="p-0 overflow-hidden flex flex-col h-full max-h-[400px] hover:shadow-2xl transition-all duration-300">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-gray-50/50 dark:bg-dark-900/50 backdrop-blur-xl sticky top-0 z-10">
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">فعالیت‌ها</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">رویدادهای اخیر باشگاه</p>
                                </div>
                                <div className="p-2.5 bg-white dark:bg-dark-700 rounded-xl shadow-sm text-primary-500 border border-gray-100 dark:border-dark-600"><Activity size={20} /></div>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-2">
                                {recentActivities.map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-dark-700 transition-all border border-transparent hover:border-gray-100 dark:hover:border-dark-600 group">
                                        <div className={`mt-1 w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm ring-2 ring-white dark:ring-dark-800 ${item.type === 'athlete' ? 'bg-orange-500' : item.type === 'plan' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                            {item.type === 'athlete' ? <User size={18} /> : item.type === 'plan' ? <FileText size={18} /> : <Check size={18} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-800 dark:text-gray-200 text-sm leading-snug truncate">{item.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium truncate">{item.meta}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-gray-100 dark:bg-dark-800 px-2 py-1 rounded-lg group-hover:bg-white dark:group-hover:bg-dark-900 transition-colors">
                                            {new Date(item.date).toLocaleDateString('fa-IR')}
                                        </div>
                                    </div>
                                ))}
                                {recentActivities.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 py-10 opacity-60">
                                        <History size={40} className="mb-2" />
                                        <p className="text-sm font-medium">هنوز فعالیتی ثبت نشده است</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6 md:space-y-8">

                    {/* Top Performers Widget (New) */}
                    {topPerformers.length > 0 && (
                        <Card variant="glass" className="p-0 overflow-hidden bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-200/50 dark:border-amber-900/30">
                            <div className="p-5 border-b border-yellow-100 dark:border-yellow-900/30">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <Trophy size={20} className="text-amber-500" /> قهرمانان تمرین
                                </h3>
                                <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-1 font-medium">بیشترین جلسات تکمیل شده</p>
                            </div>
                            <div className="p-4 space-y-3">
                                {topPerformers.map((athlete, i) => (
                                    <div key={athlete.id} className="flex items-center gap-3 bg-white/60 dark:bg-dark-800/60 p-3 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/20 shadow-sm">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${i === 0 ? 'bg-amber-400 shadow-amber-200' : i === 1 ? 'bg-slate-400 shadow-slate-200' : 'bg-orange-700 shadow-orange-200'} shadow-md`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{athlete.fullName}</div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-900 px-2 py-1 rounded-lg">
                                            {athlete.completedWorkouts} جلسه
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Needs Attention Widget */}
                    <Card variant="glass" className="p-6 bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-900/10 dark:to-orange-900/10 border-rose-200/50 dark:border-rose-900/30 relative overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-12 h-12 bg-white dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 dark:border-orange-900/30 animate-pulse">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">نیاز به پیگیری</h3>
                                <div className="text-xs text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-md w-fit mt-1">{warningAthletes.length} مورد یافت شد</div>
                            </div>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {warningAthletes.map(a => (
                                <div key={a.id} className="flex items-center justify-between p-3 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-700 shadow-sm hover:shadow-md dark:hover:bg-dark-700 transition-all cursor-pointer group" onClick={() => { setSelectedAthlete(a); setCurrentView('athletes'); }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors border border-transparent group-hover:border-orange-200">{a.fullName.charAt(0)}</div>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{a.fullName}</span>
                                    </div>
                                    <ChevronLeft size={16} className="text-gray-300 dark:text-gray-600 group-hover:-translate-x-1 transition-transform" />
                                </div>
                            ))}
                            {warningAthletes.length === 0 && (
                                <div className="text-center py-6">
                                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
                                        <Check size={18} /> همه چیز عالی است!
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">هیچ ورزشکار غیرفعالی ندارید.</p>
                                </div>
                            )}
                        </div>
                        {/* Decorative drops */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200/20 dark:bg-orange-900/20 rounded-full blur-2xl pointer-events-none"></div>
                    </Card>

                    {/* Recent Joiners */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">جدیدترین اعضا</h3>
                            <button onClick={() => setCurrentView('athletes')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full text-center min-w-[80px]">مشاهده همه</button>
                        </div>
                        {athletes.length > 0 ? (
                            <div className="space-y-3">
                                {athletes.slice(-5).reverse().map(athlete => (
                                    <div key={athlete.id} className="flex items-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-dark-800 p-3 rounded-2xl transition-all group border border-transparent hover:border-gray-100 dark:hover:border-dark-700 hover:shadow-sm" onClick={() => { setSelectedAthlete(athlete); setCurrentView('athletes'); }}>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-black text-sm group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white transition-all shadow-sm">
                                            {athlete.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{athlete.fullName}</div>
                                            <div className="text-xs text-gray-400 font-medium mt-0.5">{new Date(athlete.joinDate).toLocaleDateString('fa-IR')}</div>
                                        </div>
                                        <ChevronLeft size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8 bg-gray-50 dark:bg-dark-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700">
                                هنوز عضوی ندارید
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
