import React, { useState } from 'react';
import { Card, Button, Modal } from '../../components/UI';
import { Plus, Dumbbell, Utensils, Share2, Edit2 as Edit, Trash2 as Trash, ArrowRight } from 'lucide-react';
import { useAthleteContext } from './AthleteContext';
import { deletePlan, deleteNutritionPlan } from '../../services/electronDb';
import { WorkoutPlan } from '../../types';

interface Props {
    setCurrentView: (view: any) => void;
    setEditingPlan: (plan: WorkoutPlan | null) => void;
    setPlanToExport: (plan: WorkoutPlan) => void;
    setDietToExport: (plan: any | null) => void;
    setIsExportModalOpen: (open: boolean) => void;
}

export const PlansTab: React.FC<Props> = ({
    setCurrentView,
    setEditingPlan,
    setPlanToExport,
    setDietToExport,
    setIsExportModalOpen
}) => {
    const { athletePlans, athleteDiets, showConfirm, refreshData, addToast } = useAthleteContext();
    const [viewingPlan, setViewingPlan] = useState<WorkoutPlan | null>(null);
    const [viewingDiet, setViewingDiet] = useState<any | null>(null);

    return (
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
                {athletePlans.map(plan => (
                    <Card key={plan.id} className="p-0 flex flex-col md:flex-row overflow-hidden group">
                        <div className="bg-blue-600 text-white w-full md:w-24 flex items-center justify-center p-4 md:p-0">
                            <Dumbbell size={32} />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-center">
                            <h5 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.days.length} روز تمرینی • تاریخ: {new Date(plan.created_at).toLocaleDateString('fa-IR')}</p>
                        </div>
                        <div className="p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-100 dark:border-dark-700">
                            <Button size="sm" variant="ghost" onClick={() => setViewingPlan(plan)}>
                                <ArrowRight size={18} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setPlanToExport(plan); setDietToExport(null); setIsExportModalOpen(true); }}>
                                <Share2 size={18} />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => { setEditingPlan(plan); setCurrentView('plan-builder'); }}>
                                <Edit size={16} />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => showConfirm('حذف برنامه', 'آیا از حذف این برنامه مطمئن هستید؟', async () => { await deletePlan(plan.id); refreshData(); })}>
                                <Trash size={18} />
                            </Button>
                        </div>
                    </Card>
                ))}

                {athleteDiets.map(plan => (
                    <Card key={plan.id} className="p-0 flex flex-col md:flex-row overflow-hidden group">
                        <div className="bg-emerald-600 text-white w-full md:w-24 flex items-center justify-center p-4 md:p-0">
                            <Utensils size={32} />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-center">
                            <h5 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{plan.days.length} روز رژیم • تاریخ: {new Date(plan.created_at).toLocaleDateString('fa-IR')}</p>
                        </div>
                        <div className="p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-100 dark:border-dark-700">
                            <Button size="sm" variant="ghost" onClick={() => setViewingDiet(plan)}>
                                <ArrowRight size={18} />
                            </Button>
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

            {/* Workout Plan Viewer Modal */}
            <Modal isOpen={!!viewingPlan} onClose={() => setViewingPlan(null)} title={viewingPlan?.name || 'مشاهده برنامه'}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{viewingPlan?.notes || 'بدون توضیحات'}</p>
                    {viewingPlan?.days?.map((d, idx) => (
                        <div key={d.id || idx} className="p-3 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700">
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="font-bold text-gray-900 dark:text-white">{d.dayName}</h5>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{d.isRestDay ? 'روز استراحت' : `${d.exercises.length} حرکت`}</span>
                            </div>
                            {!d.isRestDay && d.exercises.length > 0 ? (
                                <div className="space-y-2">
                                    {d.exercises.map((ex, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{ex.exerciseName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{ex.sets} ست • {ex.reps} تکرار • {ex.rest || '-'} استراحت</p>
                                            </div>
                                            {ex.notes && <p className="text-xs text-amber-600">{ex.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">روز استراحت یا هیچ حرکتی ثبت نشده است</p>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Nutrition Plan Viewer Modal */}
            <Modal isOpen={!!viewingDiet} onClose={() => setViewingDiet(null)} title={viewingDiet?.name || 'مشاهده رژیم'}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{viewingDiet?.notes || 'بدون توضیحات'}</p>
                    {viewingDiet?.days?.map((day: any, idx: number) => (
                        <div key={day.id || idx} className="p-3 bg-gray-50 dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700">
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="font-bold text-gray-900 dark:text-white">{day.dayName}</h5>
                                {day.targetCalories && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {day.targetCalories} کالری | P:{day.targetProtein}g C:{day.targetCarbs}g F:{day.targetFat}g
                                    </span>
                                )}
                            </div>
                            {day.meals?.map((meal: any) => (
                                <div key={meal.id} className="p-2 bg-white dark:bg-dark-700 rounded-lg mt-2">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{meal.name} {meal.time && `(${meal.time})`}</p>
                                    {meal.foods?.map((food: any) => (
                                        <p key={food.id} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {food.name} - {food.amount} - {food.calories} کالری
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};
