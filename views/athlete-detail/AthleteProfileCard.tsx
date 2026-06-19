import React from 'react';
import { Card, Button } from '../../components/UI';
import { ArrowLeft, Share2, Edit2 as Edit, Trash2 as Trash } from 'lucide-react';
import { deleteAthlete } from '../../services/electronDb';
import { useAthleteContext } from './AthleteContext';

interface Props {
    setSelectedAthlete: (athlete: null) => void;
    setEditingAthlete: (id: string | null) => void;
    setIsAthleteModalOpen: (open: boolean) => void;
    setProgressToExport: (athlete: any) => void;
    setIsExportModalOpen: (open: boolean) => void;
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    refreshData: () => Promise<void>;
    addToast: (title: string, message?: string, type?: string) => void;
}

export const AthleteProfileCard: React.FC<Props> = ({
    setSelectedAthlete,
    setEditingAthlete,
    setIsAthleteModalOpen,
    setProgressToExport,
    setIsExportModalOpen,
    showConfirm,
    refreshData,
    addToast
}) => {
    const { athlete } = useAthleteContext();
    const latestMeasurement = athlete.measurements[athlete.measurements.length - 1];

    return (
        <>
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" onClick={() => setSelectedAthlete(null)} className="rounded-full w-10 h-10 p-0">
                    <ArrowLeft />
                </Button>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">پروفایل ورزشکار</h2>
            </div>

            <Card className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-4xl font-black text-gray-400 dark:text-gray-500 border-4 border-white dark:border-dark-800 shadow-lg">
                        {athlete.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 text-center md:text-right">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{athlete.fullName}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{athlete.currentGoal || 'بدون هدف'}</p>
                        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <span className="text-sm text-gray-500 dark:text-gray-400">سن:</span>
                                <span className="font-bold text-lg mr-2 text-gray-900 dark:text-white">{athlete.age}</span>
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <span className="text-sm text-gray-500 dark:text-gray-400">قد:</span>
                                <span className="font-bold text-lg mr-2 text-gray-900 dark:text-white">{athlete.height} cm</span>
                            </div>
                            <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <span className="text-sm text-gray-500 dark:text-gray-400">وزن:</span>
                                <span className="font-bold text-lg mr-2 text-gray-900 dark:text-white">
                                    {latestMeasurement?.weight || '-'} kg
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => { setProgressToExport(athlete); setIsExportModalOpen(true); }}>
                            <Share2 size={16} className="ml-2" /> خروجی
                        </Button>
                        <Button variant="secondary" onClick={() => { setEditingAthlete(athlete.id); setIsAthleteModalOpen(true); }}>
                            <Edit size={16} className="ml-2" /> ویرایش
                        </Button>
                        <Button variant="danger" className="px-4" onClick={() => {
                            showConfirm('حذف ورزشکار', `آیا از حذف ${athlete.fullName} اطمینان دارید؟`, async () => {
                                await deleteAthlete(athlete.id);
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
        </>
    );
};
