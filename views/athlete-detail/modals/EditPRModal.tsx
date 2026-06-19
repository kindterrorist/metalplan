import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Modal } from '../../../components/UI';
import JalaliDatePicker from '../../../src/components/shared/JalaliDatePicker';
import { useAthleteContext } from '../AthleteContext';
import { PersonalRecord } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pr: PersonalRecord | null;
}

export const EditPRModal: React.FC<Props> = ({ isOpen, onClose, pr }) => {
    const { athlete, updateAthlete, addToast } = useAthleteContext();
    const [date, setDate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (pr) {
            setDate(pr.date);
        }
    }, [pr]);

    if (!pr) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const updatedPR: PersonalRecord = {
            ...pr,
            exerciseName: data.get('exerciseName') as string,
            weight: parseFloat(data.get('weight') as string),
            reps: parseInt(data.get('reps') as string),
            date: data.get('date') as string,
            notes: data.get('notes') as string || undefined
        };

        const updatedRecords = (athlete.personalRecords || []).map(r =>
            r.id === pr.id ? updatedPR : r
        );

        await updateAthlete({ personalRecords: updatedRecords });
        setIsSaving(false);
        onClose();
        addToast('رکورد ویرایش شد!', '', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ویرایش رکورد">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>نام تمرین *</Label>
                    <Input type="text" name="exerciseName" defaultValue={pr.exerciseName} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>وزن (kg) *</Label>
                        <Input type="number" step="0.5" name="weight" defaultValue={pr.weight} required />
                    </div>
                    <div>
                        <Label>تعداد تکرار *</Label>
                        <Input type="number" name="reps" defaultValue={pr.reps} required />
                    </div>
                </div>
                <div>
                    <Label>تاریخ *</Label>
                    <JalaliDatePicker value={date} onChange={setDate} placeholder="انتخاب تاریخ" required={true} />
                    <input type="hidden" name="date" value={date} />
                </div>
                <div>
                    <Label>یادداشت</Label>
                    <textarea name="notes" rows={2} defaultValue={pr.notes || ''} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
            </form>
        </Modal>
    );
};
