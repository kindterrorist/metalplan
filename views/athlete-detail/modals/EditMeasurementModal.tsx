import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Modal } from '../../../components/UI';
import JalaliDatePicker from '../../../src/components/shared/JalaliDatePicker';
import { Camera } from 'lucide-react';
import { useAthleteContext } from '../AthleteContext';
import { Measurement } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    measurement: Measurement | null;
}

export const EditMeasurementModal: React.FC<Props> = ({ isOpen, onClose, measurement }) => {
    const { athlete, updateAthlete, addToast } = useAthleteContext();
    const [date, setDate] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (measurement) {
            setDate(measurement.date);
        }
    }, [measurement]);

    if (!measurement) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const updatedMeasurement: Measurement = {
            ...measurement,
            date: data.get('date') as string,
            weight: parseFloat(data.get('weight') as string),
            bodyFat: parseFloat(data.get('bodyFat') as string) || undefined,
            neck: parseFloat(data.get('neck') as string) || undefined,
            shoulder: parseFloat(data.get('shoulder') as string) || undefined,
            chest: parseFloat(data.get('chest') as string) || undefined,
            arms: parseFloat(data.get('arms') as string) || undefined,
            forearms: parseFloat(data.get('forearms') as string) || undefined,
            waist: parseFloat(data.get('waist') as string) || undefined,
            hips: parseFloat(data.get('hips') as string) || undefined,
            thighs: parseFloat(data.get('thighs') as string) || undefined,
            calves: parseFloat(data.get('calves') as string) || undefined,
            notes: data.get('notes') as string || undefined,
            mood: parseInt(data.get('mood') as string) as 1 | 2 | 3 | 4 | 5 || undefined,
        };

        const updatedMeasurements = athlete.measurements.map(m =>
            m.date === measurement.date ? updatedMeasurement : m
        );

        await updateAthlete({ measurements: updatedMeasurements });
        setIsSaving(false);
        onClose();
        addToast('اندازه‌گیری ویرایش شد!', '', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ویرایش اندازه‌گیری">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>تاریخ</Label>
                    <JalaliDatePicker value={date} onChange={setDate} placeholder="انتخاب تاریخ" />
                    <input type="hidden" name="date" value={date} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>وزن (kg) *</Label>
                        <Input type="number" step="0.1" name="weight" defaultValue={measurement.weight} required />
                    </div>
                    <div>
                        <Label>درصد چربی (%)</Label>
                        <Input type="number" step="0.1" name="bodyFat" defaultValue={measurement.bodyFat || ''} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>گردن (cm)</Label>
                        <Input type="number" step="0.1" name="neck" defaultValue={measurement.neck || ''} />
                    </div>
                    <div>
                        <Label>شانه (cm)</Label>
                        <Input type="number" step="0.1" name="shoulder" defaultValue={measurement.shoulder || ''} />
                    </div>
                    <div>
                        <Label>سینه (cm)</Label>
                        <Input type="number" step="0.1" name="chest" defaultValue={measurement.chest || ''} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>بازو (cm)</Label>
                        <Input type="number" step="0.1" name="arms" defaultValue={measurement.arms || ''} />
                    </div>
                    <div>
                        <Label>ساعد (cm)</Label>
                        <Input type="number" step="0.1" name="forearms" defaultValue={measurement.forearms || ''} />
                    </div>
                    <div>
                        <Label>کمر (cm)</Label>
                        <Input type="number" step="0.1" name="waist" defaultValue={measurement.waist || ''} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>باسن (cm)</Label>
                        <Input type="number" step="0.1" name="hips" defaultValue={measurement.hips || ''} />
                    </div>
                    <div>
                        <Label>ران (cm)</Label>
                        <Input type="number" step="0.1" name="thighs" defaultValue={measurement.thighs || ''} />
                    </div>
                    <div>
                        <Label>ساق (cm)</Label>
                        <Input type="number" step="0.1" name="calves" defaultValue={measurement.calves || ''} />
                    </div>
                </div>

                <div>
                    <Label>حال عمومی</Label>
                    <select name="mood" defaultValue={measurement.mood || ''} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                        <option value="">انتخاب کنید</option>
                        <option value="5">عالی</option>
                        <option value="4">خوب</option>
                        <option value="3">متوسط</option>
                        <option value="2">ضعیف</option>
                        <option value="1">بد</option>
                    </select>
                </div>

                <div>
                    <Label>یادداشت</Label>
                    <textarea name="notes" rows={3} defaultValue={measurement.notes || ''} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                </div>

                <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
            </form>
        </Modal>
    );
};
