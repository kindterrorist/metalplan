import React, { useState, useMemo } from 'react';
import { Athlete } from '../types';
import { Card, Button, Input } from '../components/UI';
import { Plus, Search, Filter, SortAsc, Users, UserCheck, UserX, User, Calendar, Ruler } from 'lucide-react';

interface AthletesViewProps {
    athletes: Athlete[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    setSelectedAthlete: (athlete: Athlete | null) => void;
    setEditingAthlete: (athlete: Athlete | null) => void;
    setIsAthleteModalOpen: (open: boolean) => void;
}

export const AthletesView: React.FC<AthletesViewProps> = ({
    athletes,
    searchTerm,
    setSearchTerm,
    setSelectedAthlete,
    setEditingAthlete,
    setIsAthleteModalOpen
}) => {
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
    const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'age'>('name');

    const filteredAthletes = useMemo(() => {
        return athletes
            .filter(a => {
                const matchesSearch = a.fullName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all'
                    ? true
                    : statusFilter === 'active'
                        ? (a.status === 'active' || !a.status) // Default to active if undefined
                        : a.status === 'archived';
                const matchesGender = genderFilter === 'all' ? true : a.gender === genderFilter;

                return matchesSearch && matchesStatus && matchesGender;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
                if (sortBy === 'age') return a.age - b.age;
                if (sortBy === 'joinDate') return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(); // Newest first
                return 0;
            });
    }, [athletes, searchTerm, statusFilter, genderFilter, sortBy]);

    const stats = useMemo(() => {
        const total = athletes.length;
        const active = athletes.filter(a => a.status === 'active' || !a.status).length;
        const archived = athletes.filter(a => a.status === 'archived').length;
        return { total, active, archived };
    }, [athletes]);

    return (
        <div className="space-y-8 pb-24">
            {/* Header & Stats */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">ورزشکاران</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">مدیریت و پیگیری پیشرفت شاگردان</p>
                    </div>
                    <Button onClick={() => { setSelectedAthlete(null); setEditingAthlete(null); setIsAthleteModalOpen(true); }} className="h-12 px-6 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-shadow">
                        <Plus size={20} className="ml-2" /> ورزشکار جدید
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 flex items-center justify-between border-none bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">کل ورزشکاران</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Users size={24} />
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center justify-between border-none bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10 backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">فعال</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.active}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <UserCheck size={24} />
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center justify-between border-none bg-gradient-to-br from-gray-500/10 to-gray-600/5 dark:from-gray-500/20 dark:to-gray-600/10 backdrop-blur-sm">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">بایگانی شده</p>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{stats.archived}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-500/20 flex items-center justify-center text-gray-600 dark:text-gray-400">
                            <UserX size={24} />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Controls */}
            <Card className="p-4 flex flex-col lg:flex-row gap-4 sticky top-4 z-10 backdrop-blur-xl bg-white/80 dark:bg-dark-800/80 border border-gray-200/50 dark:border-dark-700/50 shadow-lg">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="جستجو نام..."
                        className="pr-10 h-10 bg-transparent border-gray-200 dark:border-dark-600 focus:bg-white dark:focus:bg-dark-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="h-10 px-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="active">فعال</option>
                        <option value="archived">بایگانی</option>
                        <option value="all">همه</option>
                    </select>

                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value as any)}
                        className="h-10 px-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">همه جنسیت‌ها</option>
                        <option value="Male">آقا</option>
                        <option value="Female">خانم</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-10 px-3 rounded-xl border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="name">نام</option>
                        <option value="joinDate">تاریخ عضویت</option>
                        <option value="age">سن</option>
                    </select>
                </div>
            </Card>

            {/* Athletes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAthletes.map((athlete, index) => {
                    const latestMeasurement = athlete.measurements[athlete.measurements.length - 1];
                    const hasPhoto = latestMeasurement?.photos?.front;

                    return (
                        <Card
                            key={athlete.id}
                            onClick={() => setSelectedAthlete(athlete)}
                            className="group relative overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 border-gray-100 dark:border-dark-700"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                            <div className="p-5">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        {hasPhoto ? (
                                            <img
                                                src={hasPhoto}
                                                alt={athlete.fullName}
                                                className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center text-2xl font-black text-gray-400 dark:text-gray-500 shadow-inner group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white transition-colors">
                                                {athlete.fullName.charAt(0)}
                                            </div>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-dark-800 ${athlete.status === 'archived' ? 'bg-gray-400' : 'bg-emerald-500'}`} />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1 group-hover:text-primary-500 transition-colors">
                                            {athlete.fullName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{athlete.gender === 'Male' ? 'آقا' : 'خانم'}</span>
                                            <span>•</span>
                                            <span>{athlete.currentGoal || 'بدون هدف'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-dark-900/50 p-3 rounded-xl text-center group-hover:bg-white dark:group-hover:bg-dark-800 transition-colors">
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <Calendar size={12} />
                                            <span>سن</span>
                                        </div>
                                        <span className="font-black text-gray-800 dark:text-gray-200">{athlete.age}</span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-dark-900/50 p-3 rounded-xl text-center group-hover:bg-white dark:group-hover:bg-dark-800 transition-colors">
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <Ruler size={12} />
                                            <span>وزن</span>
                                        </div>
                                        <span className="font-black text-gray-800 dark:text-gray-200">
                                            {latestMeasurement?.weight || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredAthletes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="opacity-50" />
                    </div>
                    <p className="font-medium">هیچ ورزشکاری با این مشخصات یافت نشد</p>
                </div>
            )}
        </div>
    );
};
