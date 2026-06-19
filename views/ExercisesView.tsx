import React, { useState } from 'react';
import { Exercise } from '../types';
import { Button, Label, Modal, Select, Input, Textarea } from '../components/UI';
import { Plus, Dumbbell, Trash2, Edit2, Video, FileText, Search, Filter } from 'lucide-react';
import { MUSCLE_GROUPS } from '../constants';
import { deleteExercise, saveExercise } from '../services/electronDb';

interface ExercisesViewProps {
    exercises: Exercise[];
    showConfirm: (title: string, message: string, onConfirm: () => void) => void;
    refreshData: () => Promise<void>;
    addToast: (title: string) => void;
}

const EQUIPMENT_TYPES = [
    { value: 'All', label: 'همه' },
    { value: 'Machine', label: 'دستگاه' },
    { value: 'Dumbbell', label: 'دمبل' },
    { value: 'Barbell', label: 'هالتر' },
    { value: 'Cable', label: 'سیم‌کش' },
    { value: 'Bodyweight', label: 'وزن بدن' }
];

export const ExercisesView: React.FC<ExercisesViewProps> = ({
    exercises,
    showConfirm,
    refreshData,
    addToast
}) => {
    const [search, setSearch] = useState('');
    const [filterMuscle, setFilterMuscle] = useState('All');
    const [filterEquipment, setFilterEquipment] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEx, setEditingEx] = useState<Exercise | null>(null);

    const filtered = exercises.filter(e =>
        (filterMuscle === 'All' || e.muscleGroup === filterMuscle) &&
        (filterEquipment === 'All' || e.type === filterEquipment) &&
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (ex: Exercise) => {
        setEditingEx(ex);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingEx(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const exerciseData: Exercise = {
            id: editingEx ? editingEx.id : crypto.randomUUID(),
            name: formData.get('name') as string,
            muscleGroup: formData.get('muscle') as string,
            type: formData.get('type') as Exercise['type'],
            videoUrl: formData.get('videoUrl') as string,
            description: formData.get('description') as string
        };

        await saveExercise(exerciseData);
        refreshData();
        setIsModalOpen(false);
        addToast(editingEx ? 'ویرایش شد' : 'حرکت اضافه شد');
    };

    const getEquipmentLabel = (type: string) => {
        return EQUIPMENT_TYPES.find(e => e.value === type)?.label || type;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Dumbbell className="text-primary-600" />
                        بانک حرکات
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">مدیریت لیست حرکات تمرینی</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus size={20} className="ml-2" /> حرکت جدید
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700 space-y-4">
                <div className="relative">
                    <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="جستجو در حرکات..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-dark-900 border-none rounded-xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-primary-500 dark:text-white"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    {/* Muscle Filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => setFilterMuscle('All')} className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-colors border ${filterMuscle === 'All' ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300' : 'bg-transparent border-gray-200 text-gray-600 dark:border-dark-600 dark:text-gray-400'}`}>همه عضلات</button>
                        {MUSCLE_GROUPS.map(m => (
                            <button key={m} onClick={() => setFilterMuscle(m)} className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-colors border ${filterMuscle === m ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300' : 'bg-transparent border-gray-200 text-gray-600 dark:border-dark-600 dark:text-gray-400'}`}>{m}</button>
                        ))}
                    </div>

                    {/* Equipment Filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <div className="flex items-center gap-2 text-gray-400 text-xs pl-2 border-l border-gray-200 dark:border-dark-700 ml-2">
                            <Filter size={14} /> فیلتر:
                        </div>
                        {EQUIPMENT_TYPES.map(eq => (
                            <button key={eq.value} onClick={() => setFilterEquipment(eq.value)} className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-colors border ${filterEquipment === eq.value ? 'bg-secondary-50 border-secondary-200 text-secondary-700 dark:bg-secondary-900/30 dark:border-secondary-700 dark:text-secondary-300' : 'bg-transparent border-gray-200 text-gray-600 dark:border-dark-600 dark:text-gray-400'}`}>{eq.label}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(ex => (
                    <div key={ex.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 flex justify-between items-start group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="flex gap-3 w-full">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-dark-700 flex items-center justify-center text-primary-500 shrink-0">
                                <Dumbbell size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-800 dark:text-white truncate pr-1">{ex.name}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                        {ex.muscleGroup}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                                        {getEquipmentLabel(ex.type)}
                                    </span>
                                </div>
                                {(ex.description || ex.videoUrl) && (
                                    <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-dark-700">
                                        {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600"><Video size={12} /> ویدیو</a>}
                                        {ex.description && <span className="text-xs flex items-center gap-1 text-gray-400" title={ex.description}><FileText size={12} /> توضیحات</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 pr-2 border-r border-gray-100 dark:border-dark-700 mr-2 -my-2 py-2">
                            <button onClick={() => handleEdit(ex)} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg transition-colors" title="ویرایش">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => showConfirm('حذف حرکت', 'آیا از حذف این حرکت مطمئن هستید؟', async () => { await deleteExercise(ex.id); refreshData(); })} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-dark-700 rounded-lg transition-colors" title="حذف">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                    <p>هیچ حرکتی یافت نشد</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEx ? "ویرایش حرکت" : "افزودن حرکت جدید"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>نام حرکت</Label>
                        <Input name="name" required autoFocus defaultValue={editingEx?.name} placeholder="مثلا: پرس سینه دمبل" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>عضله هدف</Label>
                            <Select name="muscle" defaultValue={editingEx?.muscleGroup || MUSCLE_GROUPS[0]}>
                                {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label>نوع تجهیزات</Label>
                            <Select name="type" defaultValue={editingEx?.type || 'Machine'}>
                                {EQUIPMENT_TYPES.filter(e => e.value !== 'All').map(e => (
                                    <option key={e.value} value={e.value}>{e.label}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>لینک ویدیو آموزشی (اختیاری)</Label>
                        <Input name="videoUrl" type="url" dir="ltr" placeholder="https://instagram.com/..." defaultValue={editingEx?.videoUrl} />
                    </div>

                    <div>
                        <Label>توضیحات / نکات اجرایی (اختیاری)</Label>
                        <Textarea name="description" rows={3} placeholder="نکات مهم در مورد فرم اجرای حرکت..." defaultValue={editingEx?.description} />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>انصراف</Button>
                        <Button type="submit" className="flex-[2] h-12">
                            {editingEx ? 'ذخیره تغییرات' : 'ثبت حرکت'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
