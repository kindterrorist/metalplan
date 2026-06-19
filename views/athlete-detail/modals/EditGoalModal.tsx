import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Modal } from '../../../components/UI';
import JalaliDatePicker from '../../../src/components/shared/JalaliDatePicker';
import { useAthleteContext } from '../AthleteContext';
import { Goal } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
}

export const EditGoalModal: React.FC<Props> = ({ isOpen, onClose, goal }) => {
    const { athlete, updateAthlete, addToast } = useAthleteContext();
    const [deadlineDate, setDeadlineDate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (goal) {
            setDeadlineDate(goal.deadline || '');
        }
    }, [goal]);

    if (!goal) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const updatedGoal: Goal = {
            ...goal,
            title: data.get('title') as string,
            target: parseFloat(data.get('target') as string),
            current: parseFloat(data.get('current') as string),
            unit: data.get('unit') as string,
            deadline: data.get('deadline') as string || undefined,
        };

        const updatedGoals = (athlete.goals || []).map(g =>
            g.id === goal.id ? updatedGoal : g
        );

        await updateAthlete({ goals: updatedGoals });
        setIsSaving(false);
        onClose();
        addToast('هدف ویرایش شد!', '', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ویرایش هدف">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>عنوان هدف *</Label>
                    <Input type="text" name="title" defaultValue={goal.title} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>وضعیت فعلی *</Label>
                        <Input type="number" step="0.1" name="current" defaultValue={goal.current} required />
                    </div>
                    <div>
                        <Label>هدف *</Label>
                        <Input type="number" step="0.1" name="target" defaultValue={goal.target} required />
                    </div>
                    <div>
                        <Label>واحد *</Label>
                        <Input type="text" name="unit" defaultValue={goal.unit} required />
                    </div>
                </div>
                <div>
                    <Label>موعد (اختیاری)</Label>
                    <JalaliDatePicker value={deadlineDate} onChange={setDeadlineDate} placeholder="انتخاب موعد" />
                    <input type="hidden" name="deadline" value={deadlineDate} />
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
            </form>
        </Modal>
    );
};
