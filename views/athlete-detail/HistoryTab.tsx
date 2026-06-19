import React from 'react';
import { Card, Button } from '../../components/UI';
import { Plus, Edit2 as Edit, Trash2 as Trash } from 'lucide-react';
import { useAthleteContext } from './AthleteContext';
import { Measurement } from '../../types';

interface Props {
    setIsAddMeasurementOpen: (open: boolean) => void;
    setEditingMeasurement: (measurement: Measurement | null) => void;
}

export const HistoryTab: React.FC<Props> = ({ setIsAddMeasurementOpen, setEditingMeasurement }) => {
    const { athlete, showConfirm, addToast, updateAthlete } = useAthleteContext();

    const handleDeleteMeasurement = (measurement: Measurement) => {
        showConfirm('حذف اندازه‌گیری', `آیا از حذف اندازه‌گیری تاریخ ${new Date(measurement.date).toLocaleDateString('fa-IR')} اطمینان دارید؟`, async () => {
            const updatedMeasurements = athlete.measurements.filter(m => m.date !== measurement.date);
            await updateAthlete({ measurements: updatedMeasurements });
            addToast('اندازه‌گیری حذف شد', '', 'success');
        });
    };

    const sortedMeasurements = [...athlete.measurements].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">تاریخچه اندازه‌گیری‌ها</h4>
                    <Button onClick={() => setIsAddMeasurementOpen(true)} size="sm">
                        <Plus size={16} className="ml-2" /> اندازه‌گیری جدید
                    </Button>
                </div>

                {/* Mobile: Card layout */}
                <div className="md:hidden space-y-3">
                    {sortedMeasurements.map((m, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 dark:bg-dark-700 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {new Date(m.date).toLocaleDateString('fa-IR')}
                                </span>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => setEditingMeasurement(m)}>
                                        <Edit size={14} />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteMeasurement(m)}>
                                        <Trash size={14} />
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">وزن:</span>
                                    <span className="font-bold mr-1 text-gray-900 dark:text-white">{m.weight} kg</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">چربی:</span>
                                    <span className="mr-1 text-gray-900 dark:text-white">{m.bodyFat || '-'}%</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">کمر:</span>
                                    <span className="mr-1 text-gray-900 dark:text-white">{m.waist || '-'} cm</span>
                                </div>
                            </div>
                            {m.photos && (
                                <div className="flex gap-1">
                                    {m.photos.front && <div title="روبرو" className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                    {m.photos.side && <div title="نیم‌رخ" className="w-2 h-2 rounded-full bg-green-500"></div>}
                                    {m.photos.back && <div title="پشت" className="w-2 h-2 rounded-full bg-purple-500"></div>}
                                </div>
                            )}
                            {m.notes && <p className="text-xs text-gray-500 dark:text-gray-400">{m.notes}</p>}
                        </div>
                    ))}
                </div>

                {/* Desktop: Table layout */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-dark-700">
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">تاریخ</th>
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">وزن</th>
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">چربی</th>
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">دور کمر</th>
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">عکس</th>
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">یادداشت</th>
                                <th className="text-right p-3 text-sm font-bold text-gray-600 dark:text-gray-400">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedMeasurements.map((m, idx) => (
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
                                    <td className="p-3 text-sm text-gray-500 dark:text-gray-400">{m.notes || '-'}</td>
                                    <td className="p-3 text-sm">
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingMeasurement(m)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDeleteMeasurement(m)}>
                                                <Trash size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
