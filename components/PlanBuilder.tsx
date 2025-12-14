import React, { useState, useEffect } from 'react';
import { Athlete, Exercise, WorkoutPlan, WorkoutDay, ExerciseSet } from '../types';
import { getExercises } from '../services/electronDb';
import { Button, Input, Card, Label, Modal } from './UI';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Coffee, Dumbbell, AlertTriangle, ArrowRight, GripVertical, StickyNote } from 'lucide-react';

interface PlanBuilderProps {
  athlete: Athlete;
  onSave: (plan: WorkoutPlan) => void;
  onCancel: () => void;
  initialPlan?: WorkoutPlan;
}

export const PlanBuilder: React.FC<PlanBuilderProps> = ({ athlete, onSave, onCancel, initialPlan }) => {
  const [name, setName] = useState(initialPlan?.name || `برنامه جدید برای ${athlete.fullName}`);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  // Initialize with 7 generic days or the existing plan's days
  const [days, setDays] = useState<WorkoutDay[]>(
    initialPlan?.days || Array.from({ length: 7 }).map((_, i) => ({
      id: Math.random().toString(),
      dayName: `روز ${i + 1}`,
      exercises: [],
      isRestDay: false
    }))
  );
  const [expandedDay, setExpandedDay] = useState<string | null>(days[0]?.id || null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for deletion confirmation
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  // State for unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const handleAddExerciseToDay = (exercise: Exercise) => {
    if (!currentDayId) return;

    setDays(prev => prev.map(d => {
      if (d.id === currentDayId) {
        const newSet: ExerciseSet = {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: '3',
          reps: '12',
          rest: '60s'
        };
        return { ...d, exercises: [...d.exercises, newSet] };
      }
      return d;
    }));
    setHasUnsavedChanges(true);
    setIsExerciseModalOpen(false);
    setSearchTerm('');
  };

  const updateExerciseSet = (dayId: string, exIndex: number, field: keyof ExerciseSet, value: any) => {
    setDays(prev => prev.map(d => {
      if (d.id === dayId) {
        const newExercises = [...d.exercises];
        newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
        return { ...d, exercises: newExercises };
      }
      return d;
    }));
    setHasUnsavedChanges(true);
  };

  const removeExercise = (dayId: string, exIndex: number) => {
    setDays(prev => prev.map(d => {
      if (d.id === dayId) {
        const newExercises = [...d.exercises];
        newExercises.splice(exIndex, 1);
        return { ...d, exercises: newExercises };
      }
      return d;
    }));
    setHasUnsavedChanges(true);
  };

  const updateDayName = (dayId: string, newName: string) => {
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, dayName: newName } : d
    ));
    setHasUnsavedChanges(true);
  };

  const toggleRestDay = (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDays(prev => prev.map(d =>
      d.id === dayId ? { ...d, isRestDay: !d.isRestDay } : d
    ));
    setHasUnsavedChanges(true);
  };

  const confirmDeleteDay = () => {
    if (dayToDelete) {
      setDays(prev => prev.filter(d => d.id !== dayToDelete));
      if (expandedDay === dayToDelete) {
        setExpandedDay(null);
      }
      setDayToDelete(null);
      setHasUnsavedChanges(true);
    }
  };

  const handleAddDay = () => {
    const newDay: WorkoutDay = {
      id: Math.random().toString(),
      dayName: `روز ${days.length + 1}`,
      exercises: [],
      isRestDay: false
    };
    setDays(prev => [...prev, newDay]);
    setExpandedDay(newDay.id);
    setHasUnsavedChanges(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setHasUnsavedChanges(true);
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleSave = () => {
    const plan: WorkoutPlan = {
      id: initialPlan?.id || crypto.randomUUID(),
      athleteId: athlete.id,
      name,
      startDate: new Date().toISOString(),
      days,
      created_at: initialPlan?.created_at || Date.now()
    };
    onSave(plan);
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.muscleGroup.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-dark-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center sticky top-0 z-20 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">طراحی برنامه</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">ورزشکار: {athlete.fullName}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleCancelClick}>لغو</Button>
          <Button onClick={handleSave} className="flex gap-2 px-6">
            <Save size={18} /> ذخیره
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        <div className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 animate-slide-up">
          <Label className="text-base text-gray-800 dark:text-gray-200">عنوان برنامه</Label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="text-lg font-bold mt-2 h-12 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800"
          />
        </div>

        <div className="space-y-4">
          {days.map((day, idx) => (
            <div
              key={day.id}
              className={`rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 animate-slide-up ${day.isRestDay ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30' : 'border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800'}`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div
                className={`p-4 flex justify-between items-center cursor-pointer select-none transition-colors ${day.isRestDay ? 'hover:bg-amber-100/50 dark:hover:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-dark-700'}`}
                onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${day.isRestDay ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-500' : (day.exercises.length > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-500' : 'bg-gray-100 text-gray-400 dark:bg-dark-700 dark:text-gray-500')}`}>
                    {day.isRestDay ? <Coffee size={24} /> : <Dumbbell size={24} />}
                  </div>

                  <div className="flex flex-col gap-1">
                    {/* Editable Day Name */}
                    <input
                      value={day.dayName}
                      onChange={(e) => updateDayName(day.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="font-black text-lg text-gray-800 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:outline-none transition-all w-48 px-1"
                      placeholder="نام روز"
                    />
                    <span className={`text-xs font-medium ${day.isRestDay ? 'text-amber-600 dark:text-amber-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {day.isRestDay ? 'روز استراحت و ریکاوری' : `${day.exercises.length} حرکت تمرینی`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleRestDay(day.id, e)}
                    className={`text-xs px-4 py-2 rounded-xl font-bold border transition-all ${day.isRestDay
                        ? 'bg-white dark:bg-dark-900 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-sm'
                        : 'bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                      }`}
                  >
                    {day.isRestDay ? 'تبدیل به تمرین' : 'استراحت'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDayToDelete(day.id);
                    }}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    title="حذف روز"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="w-8 h-8 flex items-center justify-center">
                    {expandedDay === day.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {expandedDay === day.id && (
                <div className={`p-4 border-t animate-fade-in ${day.isRestDay ? 'border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/5' : 'border-gray-50 bg-gray-50/30 dark:border-dark-700 dark:bg-dark-900/30'}`}>

                  {day.isRestDay ? (
                    <div className="text-center py-12 text-amber-600/70 dark:text-amber-500/70 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-3xl mb-2 flex flex-col items-center gap-3">
                      <Coffee size={56} className="opacity-40" />
                      <div>
                        <p className="font-bold text-lg">روز استراحت</p>
                        <p className="text-sm opacity-80 mt-1">عضلات برای رشد نیاز به زمان ریکاوری دارند.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {day.exercises.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-dark-700 rounded-3xl mb-4 bg-white/50 dark:bg-dark-800/50">
                          <Dumbbell size={40} className="mx-auto mb-3 opacity-20" />
                          <p className="font-medium">هنوز حرکتی اضافه نشده است</p>
                        </div>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {day.exercises.map((ex, idx) => (
                            <div key={idx} className="flex flex-col lg:flex-row gap-4 p-4 border border-gray-100 dark:border-dark-700 rounded-2xl bg-white dark:bg-dark-800 shadow-sm relative group hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors animate-slide-up">
                              {/* Drag Handle Placeholder (Visual only for now) */}
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 dark:text-dark-600 opacity-50 hidden lg:block">
                                <GripVertical size={16} />
                              </div>

                              <div className="flex-1 pr-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-2 mb-3">
                                    <p className="font-black text-gray-800 dark:text-gray-200 text-lg">{ex.exerciseName}</p>
                                    {ex.notes && ex.notes.trim().length > 0 && (
                                      <div className="text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-lg" title="دارای یادداشت">
                                        <StickyNote size={16} />
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeExercise(day.id, idx)}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">ست (Sets)</label>
                                    <Input
                                      value={ex.sets}
                                      onChange={(e) => updateExerciseSet(day.id, idx, 'sets', e.target.value)}
                                      className="h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm"
                                      placeholder="3"
                                    />
                                  </div>
                                  <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">تکرار (Reps)</label>
                                    <Input
                                      value={ex.reps}
                                      onChange={(e) => updateExerciseSet(day.id, idx, 'reps', e.target.value)}
                                      className="h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm"
                                      placeholder="12-15"
                                    />
                                  </div>
                                  <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">استراحت</label>
                                    <Input
                                      value={ex.rest || ''}
                                      onChange={(e) => updateExerciseSet(day.id, idx, 'rest', e.target.value)}
                                      className="h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm"
                                      placeholder="-"
                                    />
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <Input
                                    value={ex.notes || ''}
                                    onChange={(e) => updateExerciseSet(day.id, idx, 'notes', e.target.value)}
                                    className="h-9 bg-gray-50 dark:bg-dark-900 border-transparent focus:bg-white dark:focus:bg-dark-800 text-xs"
                                    placeholder="نکات اجرایی (اختیاری)..."
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="secondary"
                        className="w-full border-dashed border-2 border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-all h-12"
                        onClick={() => {
                          setCurrentDayId(day.id);
                          setIsExerciseModalOpen(true);
                        }}
                      >
                        <Plus size={20} className="ml-2" /> افزودن حرکت جدید
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          <Button
            variant="ghost"
            className="w-full border-2 border-dashed border-gray-300 dark:border-dark-600 py-6 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-dark-800 hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all rounded-3xl"
            onClick={handleAddDay}
          >
            <Plus size={24} className="ml-2" /> افزودن روز جدید
          </Button>
        </div>
      </div>

      {/* Exercise Selection Modal */}
      {isExerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsExerciseModalOpen(false)} />
          <div className="relative bg-white dark:bg-dark-800 w-full sm:max-w-lg h-[85vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 border border-gray-100 dark:border-dark-700">
            <div className="p-5 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-white dark:bg-dark-800 rounded-t-3xl z-10">
              <h3 className="text-xl font-black text-gray-800 dark:text-white">انتخاب حرکت</h3>
              <button onClick={() => setIsExerciseModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"><X className="text-gray-500 dark:text-gray-400" /></button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700">
              <div className="relative">
                <Input
                  placeholder="جستجو در حرکات..."
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-dark-800"
                />
                <div className="absolute left-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  className="p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl cursor-pointer flex justify-between items-center transition-colors border-b border-gray-50 dark:border-dark-700 last:border-0 group animate-fade-in"
                  onClick={() => handleAddExerciseToDay(ex)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 flex items-center justify-center group-hover:bg-blue-200 group-hover:text-blue-700 dark:group-hover:bg-blue-800 dark:group-hover:text-white transition-colors">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{ex.name}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded-md mt-1 inline-block">{ex.muscleGroup}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:border-blue-600 rounded-xl">
                    <Plus size={18} />
                  </Button>
                </div>
              ))}
              {filteredExercises.length === 0 && (
                <div className="text-center p-12 text-gray-400 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center">
                    <Dumbbell size={32} className="opacity-20" />
                  </div>
                  <p>حرکتی یافت نشد</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!dayToDelete} onClose={() => setDayToDelete(null)} title="حذف روز تمرینی">
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="font-bold text-lg">آیا مطمئن هستید؟</h4>
              <p className="text-sm mt-1 text-amber-600/90 dark:text-amber-400/90 leading-relaxed">
                شما در حال حذف <strong>{days.find(d => d.id === dayToDelete)?.dayName}</strong> هستید. این عملیات تمام حرکات ثبت شده در این روز را پاک می‌کند.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDayToDelete(null)}>
              انصراف
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmDeleteDay}>
              بله، حذف شود
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit Unsaved Confirmation Modal */}
      <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} title="تغییرات ذخیره نشده">
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-900/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-dark-800 p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
              <Save size={28} className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg">خروج بدون ذخیره؟</h4>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                تغییراتی که اعمال کرده‌اید هنوز ذخیره نشده‌اند. در صورت خروج، تمام تغییرات از دست خواهند رفت.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1 h-12" onClick={() => setShowExitConfirm(false)}>
              ادامه ویرایش
            </Button>
            <Button variant="danger" className="flex-1 h-12" onClick={onCancel}>
              خروج بدون ذخیره
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};