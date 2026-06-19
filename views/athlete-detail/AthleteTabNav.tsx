import React from 'react';
import { BarChart3, PieChart, Trophy, Calendar, Clock } from 'lucide-react';
import { TabType } from './types';

const tabs = [
    { id: 'overview' as TabType, label: 'خلاصه', icon: BarChart3 },
    { id: 'analytics' as TabType, label: 'تحلیل‌ها', icon: PieChart },
    { id: 'records' as TabType, label: 'رکوردها و اهداف', icon: Trophy },
    { id: 'plans' as TabType, label: 'برنامه‌ها', icon: Calendar },
    { id: 'history' as TabType, label: 'تاریخچه', icon: Clock }
];

interface Props {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const AthleteTabNav: React.FC<Props> = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-dark-800 p-2 rounded-2xl border border-gray-100 dark:border-dark-700">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
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
    );
};
