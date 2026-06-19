import React, { useState } from 'react';
import { Button, Input, Label, Modal } from '../../../components/UI';
import JalaliDatePicker from '../../../src/components/shared/JalaliDatePicker';
import { useAthleteContext } from '../AthleteContext';
import { PersonalRecord } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AddPRModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { athlete, updateAthlete, addToast } = useAthleteContext();
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const newPR: PersonalRecord = {
            id: crypto.randomUUID(),
            exerciseName: data.get('exerciseName') as string,
            weight: parseFloat(data.get('weight') as string),
            reps: parseInt(data.get('reps') as string),
            date: data.get('date') as string,
            notes: data.get('notes') as string || undefined
        };

        await updateAthlete({
            personalRecords: [...(athlete.personalRecords || []), newPR]
        });

        setIsSaving(false);
        onClose();
        setDate(new Date().toISOString().split('T')[0]);
        addToast('رکورد شخصی ثبت شد!', '', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="رکورد شخصی جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>نام تمرین *</Label>
                    <Input type="text" name="exerciseName" placeholder="مثلا: پرس سینه" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>وزن (kg) *</Label>
                        <Input type="number" step="0.5" name="weight" required />
                    </div>
                    <div>
                        <Label>تعداد تکرار *</Label>
                        <Input type="number" name="reps" required />
                    </div>
                </div>
                <div>
                    <Label>تاریخ *</Label>
                    <JalaliDatePicker value={date} onChange={setDate} placeholder="انتخاب تاریخ رکورد" required={true} />
                    <input type="hidden" name="date" value={date} />
                </div>
                <div>
                    <Label>یادداشت</Label>
                    <textarea name="notes" rows={2} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ثبت رکورد'}
                </Button>
            </form>
        </Modal>
    );
};
