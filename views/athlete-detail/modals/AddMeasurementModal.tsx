import React, { useState } from 'react';
import { Button, Input, Label, Modal } from '../../../components/UI';
import JalaliDatePicker from '../../../src/components/shared/JalaliDatePicker';
import { Camera } from 'lucide-react';
import { useAthleteContext } from '../AthleteContext';
import { compressImage } from '../../../utils/helpers';
import { Measurement } from '../../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const AddMeasurementModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { athlete, updateAthlete, addToast } = useAthleteContext();
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        const photos: { front?: string; side?: string; back?: string } = {};
        const frontFile = data.get('photoFront') as File;
        if (frontFile && frontFile.size > 0) photos.front = await compressImage(frontFile);
        const sideFile = data.get('photoSide') as File;
        if (sideFile && sideFile.size > 0) photos.side = await compressImage(sideFile);
        const backFile = data.get('photoBack') as File;
        if (backFile && backFile.size > 0) photos.back = await compressImage(backFile);

        const newMeasurement: Measurement = {
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
            photos: Object.keys(photos).length > 0 ? photos : undefined
        };

        await updateAthlete({ measurements: [...athlete.measurements, newMeasurement] });
        setIsSaving(false);
        onClose();
        setDate(new Date().toISOString().split('T')[0]);
        addToast('اندازه‌گیری جدید ثبت شد!', '', 'success');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="اندازه‌گیری جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label>تاریخ</Label>
                    <JalaliDatePicker value={date} onChange={setDate} placeholder="انتخاب تاریخ اندازه‌گیری" />
                    <input type="hidden" name="date" value={date} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>وزن (kg) *</Label>
                        <Input type="number" step="0.1" name="weight" required />
                    </div>
                    <div>
                        <Label>درصد چربی (%)</Label>
                        <Input type="number" step="0.1" name="bodyFat" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>گردن (cm)</Label>
                        <Input type="number" step="0.1" name="neck" />
                    </div>
                    <div>
                        <Label>شانه (cm)</Label>
                        <Input type="number" step="0.1" name="shoulder" />
                    </div>
                    <div>
                        <Label>سینه (cm)</Label>
                        <Input type="number" step="0.1" name="chest" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>بازو (cm)</Label>
                        <Input type="number" step="0.1" name="arms" />
                    </div>
                    <div>
                        <Label>ساعد (cm)</Label>
                        <Input type="number" step="0.1" name="forearms" />
                    </div>
                    <div>
                        <Label>کمر (cm)</Label>
                        <Input type="number" step="0.1" name="waist" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>باسن (cm)</Label>
                        <Input type="number" step="0.1" name="hips" />
                    </div>
                    <div>
                        <Label>ران (cm)</Label>
                        <Input type="number" step="0.1" name="thighs" />
                    </div>
                    <div>
                        <Label>ساق (cm)</Label>
                        <Input type="number" step="0.1" name="calves" />
                    </div>
                </div>

                <div className="space-y-3 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl border border-dashed border-gray-200 dark:border-dark-700">
                    <Label className="flex items-center gap-2">
                        <Camera size={16} /> عکس‌های وضعیت بدنی
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <Label className="block text-xs mb-1">روبرو</Label>
                            <Input type="file" name="photoFront" accept="image/*" className="text-xs" />
                        </div>
                        <div className="text-center">
                            <Label className="block text-xs mb-1">نیم‌رخ</Label>
                            <Input type="file" name="photoSide" accept="image/*" className="text-xs" />
                        </div>
                        <div className="text-center">
                            <Label className="block text-xs mb-1">پشت</Label>
                            <Input type="file" name="photoBack" accept="image/*" className="text-xs" />
                        </div>
                    </div>
                </div>

                <div>
                    <Label>حال عمومی</Label>
                    <select name="mood" className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
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
                    <textarea name="notes" rows={3} className="w-full p-3 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800" />
                </div>

                <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? 'در حال ذخیره...' : 'ثبت اندازه‌گیری'}
                </Button>
            </form>
        </Modal>
    );
};
