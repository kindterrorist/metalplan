import React, { useState } from 'react';
import { Button, Input, Label, Modal } from '../../../components/UI';
import JalaliDatePicker from '../../../src/components/shared/JalaliDatePicker';
import { useAthleteContext } from '../AthleteContext';
import { Goal } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AddGoalModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { athlete, updateAthlete, addToast } = useAthleteContext();
    const [deadlineDate, setDeadlineDate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const newGoal: Goal = {
            id: crypto.randomUUID(),
            title: data.get('title') as string,
            target: parseFloat(data.get('target') as string),
            current: parseFloat(data.get('current') as string),
            unit: data.get('unit') as string,
            deadline: data.get('deadline') as string || undefined,
            achieved: false,
            createdAt: new Date().toISOString()
        };

        await updateAthlete({
            goals: [...(athlete.goals || []), newGoal]
        });

        setIsSaving(false);
        onClose();
        setDeadlineDate('');
        addToast('هدف جدید ثبت شد!', '', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="هدف جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>عنوان هدف *</Label>
                    <Input type="text" name="title" placeholder="مثلا: رسیدن به وزن ۸۰ کیلو" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>وضعیت فعلی *</Label>
                        <Input type="number" step="0.1" name="current" required />
                    </div>
                    <div>
                        <Label>هدف *</Label>
                        <Input type="number" step="0.1" name="target" required />
                    </div>
                    <div>
                        <Label>واحد *</Label>
                        <Input type="text" name="unit" placeholder="kg" required />
                    </div>
                </div>
                <div>
                    <Label>موعد (اختیاری)</Label>
                    <JalaliDatePicker value={deadlineDate} onChange={setDeadlineDate} placeholder="انتخاب موعد تحقق هدف" />
                    <input type="hidden" name="deadline" value={deadlineDate} />
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ایجاد هدف'}
                </Button>
            </form>
        </Modal>
    );
};
