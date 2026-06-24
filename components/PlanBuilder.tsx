import React, { useState, useEffect } from "react";
import { workoutPlanSchema } from "../src/utils/validationSchemas";
import {
  Athlete,
  Exercise,
  WorkoutPlan,
  WorkoutDay,
  ExerciseSet,
} from "../types";
import { getExercises } from "../services/electronDb";
import { Button, Input, Label, Modal } from "./UI";
import {
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Coffee,
  Dumbbell,
  AlertTriangle,
  GripVertical,
  StickyNote,
  Search,
  Loader2,
  Check,
  Filter,
  RotateCcw,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PlanBuilderProps {
  athlete: Athlete;
  onSave: (plan: WorkoutPlan) => void;
  onCancel: () => void;
  initialPlan?: WorkoutPlan;
}

export const PlanBuilder: React.FC<PlanBuilderProps> = ({
  athlete,
  onSave,
  onCancel,
  initialPlan,
}) => {
  const [name, setName] = useState(
    initialPlan?.name || `برنامه جدید برای ${athlete.fullName}`
  );
  const [notes, setNotes] = useState(initialPlan?.notes || '');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  // Initialize with 7 generic days or the existing plan's days
  const [days, setDays] = useState<WorkoutDay[]>(
    initialPlan?.days ||
      Array.from({ length: 7 }).map((_, i) => ({
        id: crypto.randomUUID(),
        dayName: `روز ${i + 1}`,
        exercises: [],
        isRestDay: false,
      }))
  );
  const [expandedDay, setExpandedDay] = useState<string | null>(
    days[0]?.id || null
  );
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("All");
  const [filterEquipment, setFilterEquipment] = useState("All");
  const [selectedForSuperset, setSelectedForSuperset] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for deletion confirmation
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  // State for unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<Array<{ name: string; data: WorkoutDay[] }>>([]);
  const [selectedExercises, setSelectedExercises] = useState<Record<string, Set<number>>>({});

  const validateSets = (value: string): boolean => /^\d+(-\d+)?$/.test(value);
  const validateReps = (value: string): boolean => /^\d+(-\d+)?|Failure$/i.test(value);

  const getFieldError = (dayId: string, exIndex: number, field: string): string | undefined => {
    return fieldErrors[`${dayId}-${exIndex}-${field}`];
  };

  const setFieldError = (dayId: string, exIndex: number, field: string, error: string) => {
    setFieldErrors(prev => ({ ...prev, [`${dayId}-${exIndex}-${field}`]: error }));
  };

  const clearFieldError = (dayId: string, exIndex: number, field: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[`${dayId}-${exIndex}-${field}`];
      return next;
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('workoutPlanTemplates');
      if (saved) setTemplates(JSON.parse(saved));
    } catch {}
  }, []);

  const saveAsTemplate = () => {
    const templateName = prompt('نام قالب:');
    if (!templateName) return;
    const newTemplates = [...templates, { name: templateName, data: days }];
    setTemplates(newTemplates);
    localStorage.setItem('workoutPlanTemplates', JSON.stringify(newTemplates));
  };

  const loadTemplate = (template: { name: string; data: WorkoutDay[] }) => {
    const newDays = template.data.map(d => ({ ...d, id: crypto.randomUUID() }));
    setDays(newDays);
    setExpandedDay(newDays[0]?.id || null);
    setShowTemplateModal(false);
    setHasUnsavedChanges(true);
  };

  const deleteTemplate = (index: number) => {
    const newTemplates = templates.filter((_, i) => i !== index);
    setTemplates(newTemplates);
    localStorage.setItem('workoutPlanTemplates', JSON.stringify(newTemplates));
  };

  const toggleExerciseSelection = (dayId: string, exIndex: number) => {
    setSelectedExercises(prev => {
      const daySet = prev[dayId] ? new Set(prev[dayId]) : new Set<number>();
      if (daySet.has(exIndex)) {
        daySet.delete(exIndex);
      } else {
        daySet.add(exIndex);
      }
      return { ...prev, [dayId]: daySet };
    });
  };

  const createSuperset = (dayId: string) => {
    const selected = selectedExercises[dayId];
    if (!selected || selected.size < 2) return;
    const groupId = crypto.randomUUID();
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const newExercises = d.exercises.map((ex, idx) => {
        if (selected.has(idx)) {
          return { ...ex, supersetGroupId: groupId };
        }
        return ex;
      });
      return { ...d, exercises: newExercises };
    }));
    setSelectedExercises(prev => ({ ...prev, [dayId]: new Set() }));
    setHasUnsavedChanges(true);
  };

  const removeSuperset = (dayId: string, groupId: string) => {
    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const newExercises = d.exercises.map(ex => {
        if (ex.supersetGroupId === groupId) {
          const { supersetGroupId, ...rest } = ex;
          return rest;
        }
        return ex;
      });
      return { ...d, exercises: newExercises };
    }));
    setHasUnsavedChanges(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (dayId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);

    setDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: arrayMove(d.exercises, oldIndex, newIndex) };
    }));
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    setIsLoadingExercises(true);
    getExercises()
      .then(setExercises)
      .catch(() => {})
      .finally(() => setIsLoadingExercises(false));
  }, []);

  const handleAddExerciseToDay = (exercise: Exercise) => {
    if (!currentDayId) return;

    setDays((prev) =>
      prev.map((d) => {
        if (d.id === currentDayId) {
          const newSet: ExerciseSet = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: "3",
            reps: "12",
            rest: "60s",
          };
          return { ...d, exercises: [...d.exercises, newSet] };
        }
        return d;
      })
    );
    setHasUnsavedChanges(true);
    setIsExerciseModalOpen(false);
    setSearchTerm("");
  };

  const updateExerciseSet = (
    dayId: string,
    exIndex: number,
    field: keyof ExerciseSet,
    value: string
  ) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const newExercises = [...d.exercises];
          newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
          return { ...d, exercises: newExercises };
        }
        return d;
      })
    );
    setHasUnsavedChanges(true);
  };

  const removeExercise = (dayId: string, exIndex: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const newExercises = [...d.exercises];
          newExercises.splice(exIndex, 1);
          return { ...d, exercises: newExercises };
        }
        return d;
      })
    );
    setHasUnsavedChanges(true);
  };

  const updateDayName = (dayId: string, newName: string) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, dayName: newName } : d))
    );
    setHasUnsavedChanges(true);
  };

  const toggleRestDay = (dayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, isRestDay: !d.isRestDay } : d))
    );
    setHasUnsavedChanges(true);
  };

  const confirmDeleteDay = () => {
    if (dayToDelete) {
      setDays((prev) => prev.filter((d) => d.id !== dayToDelete));
      if (expandedDay === dayToDelete) {
        setExpandedDay(null);
      }
      setDayToDelete(null);
      setHasUnsavedChanges(true);
    }
  };

  const handleAddDay = () => {
    const newDay: WorkoutDay = {
      id: crypto.randomUUID(),
      dayName: `روز ${days.length + 1}`,
      exercises: [],
      isRestDay: false,
    };
    setDays((prev) => [...prev, newDay]);
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
    const validationResult = workoutPlanSchema.safeParse({
      id: initialPlan?.id || crypto.randomUUID?.() || `plan-${Date.now()}`,
      athleteId: athlete.id,
      name,
      startDate: initialPlan?.startDate || new Date().toISOString(),
      days,
      notes,
      created_at: initialPlan?.created_at || Date.now(),
    });

    if (!validationResult.success) {
      // Extract and set validation errors
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        // Convert path to string to use as index
        const field =
          Array.isArray(issue.path) && issue.path.length > 0
            ? issue.path[0].toString()
            : "general";
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    const plan: WorkoutPlan = validationResult.data;
    onSave(plan);
    setErrors({}); // Clear errors after successful submission
  };

  const EQUIPMENT_TYPES = [
    { value: 'All', label: 'همه' },
    { value: 'Machine', label: 'دستگاه' },
    { value: 'Dumbbell', label: 'دمبل' },
    { value: 'Barbell', label: 'هالتر' },
    { value: 'Cable', label: 'سیم\u200Cکش' },
    { value: 'Bodyweight', label: 'وزن بدن' },
  ];

  const MUSCLE_GROUP_ICONS: Record<string, string> = {
    'سینه': '🫁',
    'زیربغل و پشت': '🔙',
    'سرشانه': '💪',
    'جلوبازو': '💪',
    'پشت\u200Cبازو': '💪',
    'پـا': '🦵',
    'شکم و پهلو': '🏋️',
    'هوازی': '🏃',
  };

  const EQUIPMENT_COLORS: Record<string, string> = {
    'Machine': 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
    'Dumbbell': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    'Barbell': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'Cable': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'Bodyweight': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  const EQUIPMENT_LABELS: Record<string, string> = {
    'Machine': 'دستگاه',
    'Dumbbell': 'دمبل',
    'Barbell': 'هالتر',
    'Cable': 'سیم\u200Cکش',
    'Bodyweight': 'وزن بدن',
  };

  const filteredExercises = exercises.filter(
    (e) =>
      (e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterMuscle === 'All' || e.muscleGroup === filterMuscle) &&
      (filterEquipment === 'All' || e.type === filterEquipment)
  );

  const currentDayExercises = currentDayId
    ? days.find(d => d.id === currentDayId)?.exercises || []
    : [];
  const currentDayExerciseIds = new Set(currentDayExercises.map(e => e.exerciseId));

  const groupedExercises = filteredExercises.reduce((acc, ex) => {
    if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = [];
    acc[ex.muscleGroup].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const uniqueMuscleGroups = Array.from(new Set(exercises.map(e => e.muscleGroup))) as string[];

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const toggleSupersetSelection = (exerciseId: string) => {
    setSelectedForSuperset(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  const addSelectedAsSuperset = () => {
    if (!currentDayId || selectedForSuperset.size < 2) return;
    const groupId = crypto.randomUUID();
    const selectedExercisesList = exercises.filter(e => selectedForSuperset.has(e.id));

    setDays(prev => prev.map(d => {
      if (d.id !== currentDayId) return d;
      const newSets: ExerciseSet[] = selectedExercisesList.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: '3',
        reps: '12',
        rest: '60s',
        supersetGroupId: groupId,
      }));
      return { ...d, exercises: [...d.exercises, ...newSets] };
    }));

    setSelectedForSuperset(new Set());
    setHasUnsavedChanges(true);
    setIsExerciseModalOpen(false);
    setSearchTerm('');
    setFilterMuscle('All');
    setFilterEquipment('All');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMuscle('All');
    setFilterEquipment('All');
  };

  const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);
  const activeDays = days.filter(d => !d.isRestDay && d.exercises.length > 0).length;

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-dark-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center sticky top-0 z-20 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            طراحی برنامه
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <span>ورزشکار: {athlete.fullName}</span>
            {totalExercises > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {activeDays} روز فعال • {totalExercises} حرکت
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleCancelClick}>
            لغو
          </Button>
          <Button variant="ghost" onClick={() => setShowTemplateModal(true)}>
            قالب‌ها
          </Button>
          <Button variant="ghost" onClick={saveAsTemplate}>
            ذخیره قالب
          </Button>
          <Button onClick={handleSave} className="flex gap-2 px-6">
            <Save size={18} /> ذخیره
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        <div className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 animate-slide-up space-y-4">
          <div>
            <Label className="text-base text-gray-800 dark:text-gray-200">
              عنوان برنامه
            </Label>
            <Input
              value={name}
              onChange={(e) => {
                handleNameChange(e.target.value);
                if (errors.name) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.name;
                    return newErrors;
                  });
                }
              }}
              className={`text-lg font-bold mt-2 h-12 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label className="text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <StickyNote size={18} />
              توضیحات
            </Label>
            <Input
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasUnsavedChanges(true);
                if (errors.notes) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.notes;
                    return newErrors;
                  });
                }
              }}
              placeholder="نکات مربی، هدف‌های برنامه، یادداشت‌های خاص..."
              className="w-full mt-2 p-3 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 focus:border-blue-500 dark:text-white text-sm resize-none h-24 transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          {days.map((day, idx) => (
            <div
              key={day.id}
              className={`rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 animate-slide-up ${
                day.isRestDay
                  ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30"
                  : "border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800"
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div
                className={`p-4 flex justify-between items-center cursor-pointer select-none transition-colors ${
                  day.isRestDay
                    ? "hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-dark-700"
                }`}
                onClick={() =>
                  setExpandedDay(expandedDay === day.id ? null : day.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
                      day.isRestDay
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-500"
                        : day.exercises.length > 0
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-500"
                        : "bg-gray-100 text-gray-400 dark:bg-dark-700 dark:text-gray-500"
                    }`}
                  >
                    {day.isRestDay ? (
                      <Coffee size={24} />
                    ) : (
                      <Dumbbell size={24} />
                    )}
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
                    <span
                      className={`text-xs font-medium ${
                        day.isRestDay
                          ? "text-amber-600 dark:text-amber-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {day.isRestDay
                        ? "روز استراحت و ریکاوری"
                        : `${day.exercises.length} حرکت تمرینی`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleRestDay(day.id, e)}
                    className={`text-xs px-4 py-2 rounded-xl font-bold border transition-all ${
                      day.isRestDay
                        ? "bg-white dark:bg-dark-900 border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 shadow-sm"
                        : "bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700"
                    }`}
                  >
                    {day.isRestDay ? "تبدیل به تمرین" : "استراحت"}
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
                    {expandedDay === day.id ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedDay === day.id && (
                <div
                  className={`p-4 border-t animate-fade-in ${
                    day.isRestDay
                      ? "border-amber-100 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/5"
                      : "border-gray-50 bg-gray-50/30 dark:border-dark-700 dark:bg-dark-900/30"
                  }`}
                >
                  {day.isRestDay ? (
                    <div className="text-center py-12 text-amber-600/70 dark:text-amber-500/70 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-3xl mb-2 flex flex-col items-center gap-3">
                      <Coffee size={56} className="opacity-40" />
                      <div>
                        <p className="font-bold text-lg">روز استراحت</p>
                        <p className="text-sm opacity-80 mt-1">
                          عضلات برای رشد نیاز به زمان ریکاوری دارند.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {day.exercises.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-dark-700 rounded-3xl mb-4 bg-white/50 dark:bg-dark-800/50">
                          <Dumbbell
                            size={40}
                            className="mx-auto mb-3 opacity-20"
                          />
                          <p className="font-medium">
                            هنوز حرکتی اضافه نشده است
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {/* Superset Action Bar */}
                          {selectedExercises[day.id] && selectedExercises[day.id].size >= 2 && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl mb-2">
                              <span className="text-sm font-bold text-purple-700 dark:text-purple-400">{selectedExercises[day.id].size} حرکت انتخاب شده</span>
                              <Button size="sm" onClick={() => createSuperset(day.id)} className="bg-purple-600 hover:bg-purple-700 text-white">
                                ایجاد سوپرست
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedExercises(prev => ({ ...prev, [day.id]: new Set() }))}>
                                انصراف
                              </Button>
                            </div>
                          )}

                          {/* Group exercises by supersetGroupId */}
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => handleDragEnd(day.id, event)}>
                            <SortableContext items={day.exercises.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
                              {(() => {
                            const groups: Array<{ groupId: string | null; exercises: Array<{ ex: ExerciseSet; idx: number }> }> = [];
                            const seen = new Set<string>();
                            
                            day.exercises.forEach((ex, idx) => {
                              if (ex.supersetGroupId) {
                                if (!seen.has(ex.supersetGroupId)) {
                                  seen.add(ex.supersetGroupId);
                                  groups.push({
                                    groupId: ex.supersetGroupId,
                                    exercises: day.exercises
                                      .map((e, i) => ({ ex: e, idx: i }))
                                      .filter(e => e.ex.supersetGroupId === ex.supersetGroupId)
                                  });
                                }
                              } else {
                                groups.push({ groupId: null, exercises: [{ ex, idx }] });
                              }
                            });

                            return groups.map((group, gIdx) => {
                              const isSuperset = group.groupId !== null;
                              
                              if (isSuperset) {
                                const supersetRest = group.exercises[group.exercises.length - 1]?.ex.rest;
                                return (
                                  <div key={`group-${gIdx}`} className="border-2 border-purple-300 dark:border-purple-700 rounded-2xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-2 bg-purple-50 dark:bg-purple-900/30 border-b border-purple-200 dark:border-purple-700">
                                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400">سوپرست ({group.exercises.length} حرکت)</span>
                                      <div className="flex items-center gap-2">
                                        {supersetRest && (
                                          <span className="text-[10px] text-purple-600 dark:text-purple-400">استراحت: {supersetRest}</span>
                                        )}
                                        <button
                                          onClick={() => removeSuperset(day.id, group.groupId!)}
                                          className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                          جداسازی
                                        </button>
                                      </div>
                                    </div>
                                    <div className="divide-y divide-purple-100 dark:divide-purple-800">
                                      {group.exercises.map(({ ex, idx }) => (
                                        <div key={idx} className={`flex flex-col lg:flex-row gap-4 p-4 bg-white dark:bg-dark-800 ${selectedExercises[day.id]?.has(idx) ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}>
                                          <div className="flex-1 pr-4">
                                            <div className="flex justify-between items-start">
                                              <div className="flex items-center gap-2 mb-3">
                                                <button
                                                  onClick={() => toggleExerciseSelection(day.id, idx)}
                                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                    selectedExercises[day.id]?.has(idx)
                                                      ? 'bg-purple-600 border-purple-600 text-white'
                                                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                                  }`}
                                                >
                                                  {selectedExercises[day.id]?.has(idx) && (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                      <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                  )}
                                                </button>
                                                <p className="font-black text-gray-800 dark:text-gray-200 text-lg">{ex.exerciseName}</p>
                                                {ex.notes && ex.notes.trim().length > 0 && (
                                                  <div className="text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-lg" title="دارای یادداشت">
                                                    <StickyNote size={16} />
                                                  </div>
                                                )}
                                              </div>
                                              <button onClick={() => removeExercise(day.id, idx)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                <Trash2 size={18} />
                                              </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                              <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">ست</label>
                                                <Input value={ex.sets} onChange={(e) => { updateExerciseSet(day.id, idx, "sets", e.target.value); if (validateSets(e.target.value) || e.target.value === '') clearFieldError(day.id, idx, 'sets'); }} onBlur={(e) => { if (e.target.value && !validateSets(e.target.value)) setFieldError(day.id, idx, 'sets', 'فرمت نامعتبر'); }} className={`h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm ${getFieldError(day.id, idx, 'sets') ? 'border-red-500' : ''}`} placeholder="3" />
                                              </div>
                                              <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">تکرار</label>
                                                <Input value={ex.reps} onChange={(e) => { updateExerciseSet(day.id, idx, "reps", e.target.value); if (validateReps(e.target.value) || e.target.value === '') clearFieldError(day.id, idx, 'reps'); }} onBlur={(e) => { if (e.target.value && !validateReps(e.target.value)) setFieldError(day.id, idx, 'reps', 'فرمت نامعتبر'); }} className={`h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm ${getFieldError(day.id, idx, 'reps') ? 'border-red-500' : ''}`} placeholder="12" />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              // Standalone exercise
                              return group.exercises.map(({ ex, idx }) => (
                                <div
                                  key={idx}
                                  className={`flex flex-col lg:flex-row gap-4 p-4 border border-gray-100 dark:border-dark-700 rounded-2xl bg-white dark:bg-dark-800 shadow-sm relative group hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors animate-slide-up ${selectedExercises[day.id]?.has(idx) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}`}
                                >
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 dark:text-dark-600 opacity-50 hidden lg:block">
                                    <GripVertical size={16} />
                                  </div>
                                  <div className="flex-1 pr-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2 mb-3">
                                        <button
                                          onClick={() => toggleExerciseSelection(day.id, idx)}
                                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            selectedExercises[day.id]?.has(idx)
                                              ? 'bg-blue-600 border-blue-600 text-white'
                                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                          }`}
                                        >
                                          {selectedExercises[day.id]?.has(idx) && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                          )}
                                        </button>
                                        <p className="font-black text-gray-800 dark:text-gray-200 text-lg">
                                          {ex.exerciseName}
                                        </p>
                                        {ex.notes && ex.notes.trim().length > 0 && (
                                          <div className="text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-1 rounded-lg" title="دارای یادداشت">
                                            <StickyNote size={16} />
                                          </div>
                                        )}
                                      </div>
                                      <button onClick={() => removeExercise(day.id, idx)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                      <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">ست (Sets)</label>
                                        <Input value={ex.sets} onChange={(e) => { updateExerciseSet(day.id, idx, "sets", e.target.value); if (validateSets(e.target.value) || e.target.value === '') clearFieldError(day.id, idx, 'sets'); }} onBlur={(e) => { if (e.target.value && !validateSets(e.target.value)) setFieldError(day.id, idx, 'sets', 'فرمت نامعتبر (مثال: 3 یا 3-4)'); }} className={`h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm ${getFieldError(day.id, idx, 'sets') ? 'border-red-500' : ''}`} placeholder="3" />
                                        {getFieldError(day.id, idx, 'sets') && <p className="text-[10px] text-red-500 mt-1">{getFieldError(day.id, idx, 'sets')}</p>}
                                      </div>
                                      <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">تکرار (Reps)</label>
                                        <Input value={ex.reps} onChange={(e) => { updateExerciseSet(day.id, idx, "reps", e.target.value); if (validateReps(e.target.value) || e.target.value === '') clearFieldError(day.id, idx, 'reps'); }} onBlur={(e) => { if (e.target.value && !validateReps(e.target.value)) setFieldError(day.id, idx, 'reps', 'فرمت نامعتبر (مثال: 12, 12-15, Failure)'); }} className={`h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm ${getFieldError(day.id, idx, 'reps') ? 'border-red-500' : ''}`} placeholder="12-15" />
                                        {getFieldError(day.id, idx, 'reps') && <p className="text-[10px] text-red-500 mt-1">{getFieldError(day.id, idx, 'reps')}</p>}
                                      </div>
                                      <div className="bg-gray-50 dark:bg-dark-900 p-2 rounded-xl border border-gray-100 dark:border-dark-700">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">استراحت</label>
                                        <Input value={ex.rest || ""} onChange={(e) => updateExerciseSet(day.id, idx, "rest", e.target.value)} className="h-8 bg-white dark:bg-dark-800 text-center font-bold text-sm" placeholder="60s" />
                                      </div>
                                    </div>
                                    <div className="mt-3">
                                      <Input value={ex.notes || ""} onChange={(e) => updateExerciseSet(day.id, idx, "notes", e.target.value)} className="h-9 bg-gray-50 dark:bg-dark-900 border-transparent focus:bg-white dark:focus:bg-dark-800 text-xs" placeholder="نکات اجرایی (اختیاری)..." />
                                    </div>
                                  </div>
                                </div>
                              ));
                            });
                          })()}
                            </SortableContext>
                          </DndContext>
                        </div>
                      )}

                      <Button
                        variant="secondary"
                        className="w-full border-dashed border-2 border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-all h-12"
                        onClick={() => {
                          setCurrentDayId(day.id);
                          setSelectedForSuperset(new Set());
                          setFilterMuscle('All');
                          setFilterEquipment('All');
                          setSearchTerm('');
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
          <div
            className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => { setIsExerciseModalOpen(false); setSelectedForSuperset(new Set()); setSearchTerm(''); setFilterMuscle('All'); setFilterEquipment('All'); }}
          />
          <div className="relative bg-white dark:bg-dark-800 w-full sm:max-w-lg h-[85vh] sm:h-[650px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 border border-gray-100 dark:border-dark-700">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-dark-700 flex justify-between items-center bg-white dark:bg-dark-800 rounded-t-3xl z-20">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-gray-800 dark:text-white">
                  انتخاب حرکت
                </h3>
                {filteredExercises.length > 0 && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                    {filteredExercises.length} حرکت
                  </span>
                )}
              </div>
              <button
                onClick={() => { setIsExerciseModalOpen(false); setSelectedForSuperset(new Set()); setSearchTerm(''); setFilterMuscle('All'); setFilterEquipment('All'); }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <X className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Search + Filters (Sticky) */}
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-dark-700">
              <div className="p-4">
                <div className="relative">
                  <Input
                    placeholder="جستجو در حرکات..."
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-dark-900"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>
              </div>

              {/* Muscle Group Chips */}
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setFilterMuscle('All')}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    filterMuscle === 'All'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  همه
                </button>
                {uniqueMuscleGroups.map(mg => (
                  <button
                    key={mg}
                    onClick={() => setFilterMuscle(filterMuscle === mg ? 'All' : mg)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      filterMuscle === mg
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {MUSCLE_GROUP_ICONS[mg] || '💪'} {mg}
                  </button>
                ))}
              </div>

              {/* Equipment Type Chips */}
              <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                {EQUIPMENT_TYPES.map(eq => (
                  <button
                    key={eq.value}
                    onClick={() => setFilterEquipment(eq.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      filterEquipment === eq.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-600'
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {isLoadingExercises ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">در حال بارگذاری حرکات...</p>
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="text-center p-12 text-gray-400 flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
                    <Dumbbell size={40} className="opacity-20" />
                  </div>
                  <p className="font-bold text-gray-500 dark:text-gray-400">هیچ حرکتی با فیلتر انتخابی یافت نشد</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">فیلترها را تغییر دهید یا جستجو را پاک کنید</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  >
                    <RotateCcw size={14} /> پاک کردن فیلترها
                  </button>
                </div>
              ) : (
                (Object.entries(groupedExercises) as [string, Exercise[]][]).map(([muscleGroup, groupExercises]) => (
                  <div key={muscleGroup} className="mb-3">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroupCollapse(muscleGroup)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-900 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors mb-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{MUSCLE_GROUP_ICONS[muscleGroup] || '💪'}</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{muscleGroup}</span>
                        <span className="text-[10px] bg-gray-200 dark:bg-dark-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full font-bold">
                          {groupExercises.length}
                        </span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${collapsedGroups.has(muscleGroup) ? '-rotate-90' : ''}`}
                      />
                    </button>

                    {/* Group Items */}
                    {!collapsedGroups.has(muscleGroup) && (
                      <div className="space-y-1">
                        {groupExercises.map((ex) => {
                          const isAlreadyAdded = currentDayExerciseIds.has(ex.id);
                          const isSelectedForSuperset = selectedForSuperset.has(ex.id);
                          return (
                            <div
                              key={ex.id}
                              className={`p-3 rounded-2xl flex justify-between items-center transition-all border group animate-fade-in ${
                                isSelectedForSuperset
                                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                                  : isAlreadyAdded
                                  ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
                                  : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-dark-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800/30'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Superset Checkbox */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleSupersetSelection(ex.id); }}
                                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                                    isSelectedForSuperset
                                      ? 'bg-purple-600 border-purple-600 text-white'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                  }`}
                                >
                                  {isSelectedForSuperset && (
                                    <Check size={14} />
                                  )}
                                </button>

                                {/* Exercise Icon */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  isAlreadyAdded
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400 group-hover:bg-blue-200 group-hover:text-blue-700 dark:group-hover:bg-blue-800 dark:group-hover:text-white'
                                }`}>
                                  {isAlreadyAdded ? <Check size={20} /> : <Dumbbell size={20} />}
                                </div>

                                {/* Exercise Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className={`font-bold text-sm truncate ${
                                      isAlreadyAdded ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'
                                    }`}>
                                      {ex.name}
                                    </p>
                                    {isAlreadyAdded && (
                                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold shrink-0">
                                        اضافه شده
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${EQUIPMENT_COLORS[ex.type] || 'bg-gray-100 text-gray-500'}`}>
                                      {EQUIPMENT_LABELS[ex.type] || ex.type}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Add Button */}
                              <button
                                onClick={() => handleAddExerciseToDay(ex)}
                                className={`p-2 rounded-xl shrink-0 transition-all ml-2 ${
                                  isAlreadyAdded
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                    : 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 dark:hover:border-blue-600 text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Superset Action Bar */}
            {selectedForSuperset.size >= 2 && (
              <div className="border-t border-gray-100 dark:border-dark-700 p-4 bg-white dark:bg-dark-800 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <span className="text-lg">🔗</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">
                        {selectedForSuperset.size} حرکت انتخاب شده
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">برای ایجاد سوپرست</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedForSuperset(new Set())}
                      className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={addSelectedAsSuperset}
                      className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shadow-lg shadow-purple-200 dark:shadow-none"
                    >
                      ایجاد سوپرست
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!dayToDelete}
        onClose={() => setDayToDelete(null)}
        title="حذف روز تمرینی"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
            <div className="bg-amber-100 dark:bg-amber-900/40 p-2.5 rounded-xl">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="font-bold text-lg">آیا مطمئن هستید؟</h4>
              <p className="text-sm mt-1 text-amber-600/90 dark:text-amber-400/90 leading-relaxed">
                شما در حال حذف{" "}
                <strong>
                  {days.find((d) => d.id === dayToDelete)?.dayName}
                </strong>{" "}
                هستید. این عملیات تمام حرکات ثبت شده در این روز را پاک می‌کند.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setDayToDelete(null)}
            >
              انصراف
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={confirmDeleteDay}
            >
              بله، حذف شود
            </Button>
          </div>
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="قالب‌های ذخیره شده">
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
              <p>هنوز قالبی ذخیره نشده است</p>
              <p className="text-xs mt-1">از دکمه "ذخیره قالب" برای ساخت قالب جدید استفاده کنید</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-900 rounded-xl border border-gray-200 dark:border-dark-700">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.data.length} روز</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => loadTemplate(template)}>بارگذاری</Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteTemplate(idx)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Exit Unsaved Confirmation Modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="تغییرات ذخیره نشده"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-dark-900/50 p-4 rounded-2xl border border-gray-100 dark:border-dark-700 text-gray-700 dark:text-gray-300">
            <div className="bg-white dark:bg-dark-800 p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-dark-700">
              <Save size={28} className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg">خروج بدون ذخیره؟</h4>
              <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                تغییراتی که اعمال کرده‌اید هنوز ذخیره نشده‌اند. در صورت خروج،
                تمام تغییرات از دست خواهند رفت.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1 h-12"
              onClick={() => setShowExitConfirm(false)}
            >
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
