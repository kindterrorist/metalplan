import React from 'react';
import { Card, Button } from '../../components/UI';
import { Trophy, Target, Plus, Edit2 as Edit, Trash2 as Trash, CheckCircle } from 'lucide-react';
import { useAthleteContext } from './AthleteContext';
import { calculateGoalProgress } from '../../utils/helpers';
import { PersonalRecord, Goal } from '../../types';

interface Props {
    setIsAddPROpen: (open: boolean) => void;
    setIsAddGoalOpen: (open: boolean) => void;
    setEditingPR: (pr: PersonalRecord | null) => void;
    setEditingGoal: (goal: Goal | null) => void;
}

export const RecordsTab: React.FC<Props> = ({
    setIsAddPROpen,
    setIsAddGoalOpen,
    setEditingPR,
    setEditingGoal
}) => {
    const { athlete, showConfirm, addToast, updateAthlete } = useAthleteContext();

    const handleDeletePR = (pr: PersonalRecord) => {
        showConfirm('حذف رکورد', `آیا از حذف رکورد ${pr.exerciseName} اطمینان دارید؟`, async () => {
            const updatedPRs = (athlete.personalRecords || []).filter(r => r.id !== pr.id);
            await updateAthlete({ personalRecords: updatedPRs });
            addToast('رکورد حذف شد', '', 'success');
        });
    };

    const handleDeleteGoal = (goal: Goal) => {
        showConfirm('حذف هدف', `آیا از حذف هدف "${goal.title}" اطمینان دارید؟`, async () => {
            const updatedGoals = (athlete.goals || []).filter(g => g.id !== goal.id);
            await updateAthlete({ goals: updatedGoals });
            addToast('هدف حذف شد', '', 'success');
        });
    };

    const handleToggleGoalAchieved = async (goal: Goal) => {
        const updatedGoals = (athlete.goals || []).map(g =>
            g.id === goal.id ? { ...g, achieved: !g.achieved } : g
        );
        await updateAthlete({ goals: updatedGoals });
        addToast(goal.achieved ? 'هدف علامت‌گذاری نشد' : 'هدف محقق شد!', '', 'success');
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">رکوردهای شخصی</h4>
                    <Button onClick={() => setIsAddPROpen(true)} size="sm">
                        <Plus size={16} className="ml-2" /> افزودن رکورد
                    </Button>
                </div>
                {(athlete.personalRecords || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Trophy size={48} className="mx-auto mb-3 opacity-30" />
                        <p>هنوز رکوردی ثبت نشده است</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {(athlete.personalRecords || [])
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(pr => (
                                <div key={pr.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                                            <Trophy className="text-amber-600" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{pr.exerciseName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(pr.date).toLocaleDateString('fa-IR')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <p className="font-black text-xl text-primary-600">{pr.weight} kg</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{pr.reps} تکرار</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => setEditingPR(pr)}>
                                                <Edit size={14} />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDeletePR(pr)}>
                                                <Trash size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </Card>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">اهداف</h4>
                    <Button onClick={() => setIsAddGoalOpen(true)} size="sm">
                        <Plus size={16} className="ml-2" /> هدف جدید
                    </Button>
                </div>
                {(athlete.goals || []).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <Target size={48} className="mx-auto mb-3 opacity-30" />
                        <p>هنوز هدفی تعریف نشده است</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {(athlete.goals || []).map(goal => {
                            const progress = calculateGoalProgress(goal);
                            return (
                                <div key={goal.id} className={`p-4 rounded-xl ${goal.achieved ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-dark-700'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {goal.title}
                                                {goal.achieved && <CheckCircle className="text-green-600" size={18} />}
                                            </p>
                                            {goal.deadline && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    موعد: {new Date(goal.deadline).toLocaleDateString('fa-IR')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {goal.current} / {goal.target} {goal.unit}
                                            </p>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => handleToggleGoalAchieved(goal)}>
                                                    <CheckCircle size={14} className={goal.achieved ? 'text-green-600' : 'text-gray-400'} />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingGoal(goal)}>
                                                    <Edit size={14} />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteGoal(goal)}>
                                                    <Trash size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-3 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${goal.achieved ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{progress}% تکمیل شده</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};
