import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { nutritionPlanSchema } from '../src/utils/validationSchemas';
import { Athlete, NutritionPlan, DietDay, Meal, FoodItem, FoodLibraryItem } from '../types';
import { Button, Input, Modal, Label, Select } from './UI';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Utensils, AlertTriangle, Coffee, Flame, Droplet, Wheat, Activity, Search, StickyNote, Clock, Check, RotateCcw } from 'lucide-react';
import { getFoodLibraryItems } from '../services/electronDb';

interface NutritionBuilderProps {
  athlete: Athlete;
  onSave: (plan: NutritionPlan) => void;
  onCancel: () => void;
  initialPlan?: NutritionPlan;
}

export const NutritionBuilder: React.FC<NutritionBuilderProps> = ({ athlete, onSave, onCancel, initialPlan }) => {
  const [name, setName] = useState(initialPlan?.name || `رژیم غذایی برای ${athlete.fullName}`);
  const [notes, setNotes] = useState(initialPlan?.notes || '');
  const [days, setDays] = useState<DietDay[]>(
    initialPlan?.days || [
        { 
            id: crypto.randomUUID(), 
            dayName: 'روز تمرین (Training)', 
            meals: [
                { id: crypto.randomUUID(), name: 'صبحانه', foods: [] },
                { id: crypto.randomUUID(), name: 'ناهار', foods: [] },
                { id: crypto.randomUUID(), name: 'قبل تمرین', foods: [] },
                { id: crypto.randomUUID(), name: 'شام', foods: [] }
            ] 
        }
    ]
 );
  const [expandedDay, setExpandedDay] = useState<string | null>(days[0]?.id || null);
  
  // Food Modal State
 const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [currentDayId, setCurrentDayId] = useState<string | null>(null);
  const [currentMealId, setCurrentMealId] = useState<string | null>(null);
  const [foodModalTab, setFoodModalTab] = useState<'library' | 'custom'>('library');
  
  // Food Library State
  const [libraryFoods, setLibraryFoods] = useState<FoodLibraryItem[]>([]);
  const [filteredLibraryFoods, setFilteredLibraryFoods] = useState<FoodLibraryItem[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState('All');
  const [recentFoodIds, setRecentFoodIds] = useState<string[]>([]);
  const [selectedFoodForPortion, setSelectedFoodForPortion] = useState<FoodLibraryItem | null>(null);
  const [portionAmount, setPortionAmount] = useState('');
  const [sessionMacros, setSessionMacros] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Temporary Food Form State
  const [foodForm, setFoodForm] = useState<Partial<FoodItem>>({ name: '', amount: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // State for validation errors
 const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation State
 const [showExitConfirm, setShowExitConfirm] = useState(false);
 const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 const [dayToDelete, setDayToDelete] = useState<string | null>(null);
 const [foodFormErrors, setFoodFormErrors] = useState<Record<string, string>>({});
 const [showTemplateModal, setShowTemplateModal] = useState(false);
 const [templates, setTemplates] = useState<Array<{ name: string; data: DietDay[] }>>([]);

  // Load food library items when modal opens
  useEffect(() => {
    if (isFoodModalOpen && foodModalTab === 'library') {
      loadLibraryFoods();
      loadRecentFoods();
      setSessionMacros({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
    if (!isFoodModalOpen) {
      setSelectedFoodForPortion(null);
      setPortionAmount('');
    }
  }, [isFoodModalOpen, foodModalTab]);

  const FOOD_CATEGORIES = [
    { value: 'All', label: 'هممه', icon: '🍽️' },
    { value: 'پروتئین', label: 'پروتئین', icon: '🥩' },
    { value: 'کربوهیدرات', label: 'کربوهیدرات', icon: '🌾' },
    { value: 'چربی', label: 'چربی', icon: '🫒' },
    { value: 'میوه', label: 'میوه', icon: '🍎' },
    { value: 'سبزیجات', label: 'سبزیجات', icon: '🥦' },
    { value: 'غلات', label: 'غلات', icon: '🍞' },
    { value: 'لبنیات', label: 'لبنیات', icon: '🥛' },
    { value: 'آجیل', label: 'آجیل', icon: '🥜' },
    { value: 'نوشیدنی', label: 'نوشیدنی', icon: '🥤' },
    { value: 'سایر', label: 'سایر', icon: '📦' },
  ];

  const PORTION_PRESETS = ['100g', '200g', '150g', '1 لیوان', '1 عدد', 'نصف'];

  const loadRecentFoods = () => {
    try {
      const saved = localStorage.getItem('recentFoods');
      if (saved) setRecentFoodIds(JSON.parse(saved));
    } catch {}
  };

  const saveRecentFood = (foodId: string) => {
    setRecentFoodIds(prev => {
      const updated = [foodId, ...prev.filter(id => id !== foodId)].slice(0, 5);
      localStorage.setItem('recentFoods', JSON.stringify(updated));
      return updated;
    });
  };

  // Load templates
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nutritionPlanTemplates');
      if (saved) setTemplates(JSON.parse(saved));
    } catch {}
  }, []);

  const saveAsTemplate = () => {
    const templateName = prompt('نام قالب:');
    if (!templateName) return;
    const newTemplates = [...templates, { name: templateName, data: days }];
    setTemplates(newTemplates);
    localStorage.setItem('nutritionPlanTemplates', JSON.stringify(newTemplates));
  };

  const loadTemplate = (template: { name: string; data: DietDay[] }) => {
    const newDays = template.data.map(d => ({
      ...d,
      id: crypto.randomUUID(),
      meals: d.meals.map(m => ({ ...m, id: crypto.randomUUID() }))
    }));
    setDays(newDays);
    setExpandedDay(newDays[0]?.id || null);
    setShowTemplateModal(false);
    setHasUnsavedChanges(true);
  };

  const deleteTemplate = (index: number) => {
    const newTemplates = templates.filter((_, i) => i !== index);
    setTemplates(newTemplates);
    localStorage.setItem('nutritionPlanTemplates', JSON.stringify(newTemplates));
  };

  // Filter library foods based on search query and category
  useEffect(() => {
    let filtered = libraryFoods;

    if (foodCategoryFilter !== 'All') {
      filtered = filtered.filter(item => item.category === foodCategoryFilter);
    }

    if (librarySearchQuery.trim() !== '') {
      const query = librarySearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.category && item.category.toLowerCase().includes(query)) ||
          (item.brand && item.brand.toLowerCase().includes(query))
      );
    }

    setFilteredLibraryFoods(filtered);
  }, [librarySearchQuery, libraryFoods, foodCategoryFilter]);

  const loadLibraryFoods = async () => {
    try {
      setLibraryLoading(true);
      const data = await getFoodLibraryItems();
      setLibraryFoods(data);
      setFilteredLibraryFoods(data);
    } catch (error) {
      console.error('Error loading food library:', error);
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleAddFoodFromLibrary = (libraryFood: FoodLibraryItem, customAmount?: string) => {
    if (!currentDayId || !currentMealId) return;

    const amount = customAmount || libraryFood.amount;
    const amountMultiplier = customAmount ? parseAmountMultiplier(customAmount, libraryFood.amount) : 1;

    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: libraryFood.name,
      amount,
      calories: Math.round(libraryFood.calories * amountMultiplier),
      protein: Math.round(libraryFood.protein * amountMultiplier * 10) / 10,
      carbs: Math.round(libraryFood.carbs * amountMultiplier * 10) / 10,
      fat: Math.round(libraryFood.fat * amountMultiplier * 10) / 10,
    };

    setDays(prev => prev.map(d => {
      if (d.id === currentDayId) {
        return {
          ...d,
          meals: d.meals.map(m => {
            if (m.id === currentMealId) {
              return { ...m, foods: [...m.foods, newFood] };
            }
            return m;
          })
        };
      }
      return d;
    }));

    setSessionMacros(prev => ({
      calories: prev.calories + newFood.calories,
      protein: prev.protein + newFood.protein,
      carbs: prev.carbs + newFood.carbs,
      fat: prev.fat + newFood.fat,
    }));

    saveRecentFood(libraryFood.id);
    setHasUnsavedChanges(true);
    setIsFoodModalOpen(false);
    setFoodModalTab('library');
    setLibrarySearchQuery('');
    setFoodCategoryFilter('All');
    setSelectedFoodForPortion(null);
    setPortionAmount('');
  };

  const parseAmountMultiplier = (customAmount: string, originalAmount: string): number => {
    const customNum = parseFloat(customAmount);
    const originalNum = parseFloat(originalAmount);
    if (!isNaN(customNum) && !isNaN(originalNum) && originalNum > 0) {
      return customNum / originalNum;
    }
    return 1;
  };

  const calculateDayMacros = (day: DietDay) => {
      let cals = 0, prot = 0, carb = 0, fat = 0;
      day.meals.forEach(meal => {
          meal.foods.forEach(food => {
              cals += Number(food.calories);
              prot += Number(food.protein);
              carb += Number(food.carbs);
              fat += Number(food.fat);
          });
      });
      return { cals, prot, carb, fat };
  };

  const getMacroPercentage = (actual: number, target?: number): number => {
      if (!target || target <= 0) return 0;
      return Math.min(Math.round((actual / target) * 100), 100);
  };

  const getMacroColor = (percentage: number): string => {
      if (percentage >= 90 && percentage <= 110) return 'text-emerald-600 dark:text-emerald-400';
      if (percentage < 90) return 'text-amber-600 dark:text-amber-400';
      return 'text-red-600 dark:text-red-400';
  };

  const updateDayMacroTarget = (dayId: string, field: 'targetCalories' | 'targetProtein' | 'targetCarbs' | 'targetFat', value: number) => {
      setDays(prev => prev.map(d => d.id === dayId ? { ...d, [field]: value || undefined } : d));
      setHasUnsavedChanges(true);
  };

  const handleAddDay = () => {
    const newDay: DietDay = {
        id: crypto.randomUUID(),
        dayName: `روز جدید ${days.length + 1}`,
        meals: [
            { id: crypto.randomUUID(), name: 'صبحانه', foods: [] },
            { id: crypto.randomUUID(), name: 'ناهار', foods: [] },
            { id: crypto.randomUUID(), name: 'شام', foods: [] }
        ]
    };
    setDays(prev => [...prev, newDay]);
    setExpandedDay(newDay.id);
    setHasUnsavedChanges(true);
  };

  const handleAddMeal = (dayId: string) => {
      setDays(prev => prev.map(d => {
          if(d.id === dayId) {
              return { ...d, meals: [...d.meals, { id: crypto.randomUUID(), name: 'میان وعده', foods: [] }]};
          }
          return d;
      }));
      setHasUnsavedChanges(true);
  };

  const handleDeleteMeal = (dayId: string, mealId: string) => {
    setDays(prev => prev.map(d => {
        if(d.id === dayId) {
            return { ...d, meals: d.meals.filter(m => m.id !== mealId)};
        }
        return d;
    }));
    setHasUnsavedChanges(true);
 };

  const handleDeleteDay = (dayId: string) => {
      setDayToDelete(dayId);
  }

  const confirmDeleteDay = () => {
      if (dayToDelete) {
          setDays(prev => prev.filter(d => d.id !== dayToDelete));
          if (expandedDay === dayToDelete) setExpandedDay(null);
          setDayToDelete(null);
          setHasUnsavedChanges(true);
      }
  }

  const handleSaveFood = () => {
      const newErrors: Record<string, string> = {};
      if (!foodForm.name?.trim()) newErrors.name = 'نام غذا الزامی است';
      if (!foodForm.amount?.trim()) newErrors.amount = 'مقدار غذا الزامی است';
      if (foodForm.calories !== undefined && foodForm.calories < 0) newErrors.calories = 'کالری نمی‌تواند منفی باشد';
      if (foodForm.protein !== undefined && foodForm.protein < 0) newErrors.protein = 'پروتئین نمی‌تواند منفی باشد';
      if (foodForm.carbs !== undefined && foodForm.carbs < 0) newErrors.carbs = 'کربوهیدرات نمی‌تواند منفی باشد';
      if (foodForm.fat !== undefined && foodForm.fat < 0) newErrors.fat = 'چربی نمی‌تواند منفی باشد';
      
      if (Object.keys(newErrors).length > 0) {
          setFoodFormErrors(newErrors);
          return;
      }
      setFoodFormErrors({});
      
      if(!currentDayId || !currentMealId) return;
      
      const newFood: FoodItem = {
          id: crypto.randomUUID(),
          name: foodForm.name,
          amount: foodForm.amount || '1 عدد',
          calories: Number(foodForm.calories) || 0,
          protein: Number(foodForm.protein) || 0,
          carbs: Number(foodForm.carbs) || 0,
          fat: Number(foodForm.fat) || 0
      };

      setDays(prev => prev.map(d => {
          if(d.id === currentDayId) {
              return {
                  ...d,
                  meals: d.meals.map(m => {
                      if(m.id === currentMealId) {
                          return { ...m, foods: [...m.foods, newFood] };
                      }
                      return m;
                  })
              }
          }
          return d;
      }));
      
      setHasUnsavedChanges(true);
      setIsFoodModalOpen(false);
      setFoodModalTab('library');
      setFoodForm({ name: '', amount: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
      setLibrarySearchQuery('');
  };

  const handleDeleteFood = (dayId: string, mealId: string, foodId: string) => {
      setDays(prev => prev.map(d => {
          if(d.id === dayId) {
              return {
                  ...d,
                  meals: d.meals.map(m => {
                      if(m.id === mealId) {
                          return { ...m, foods: m.foods.filter(f => f.id !== foodId) };
                      }
                      return m;
                  })
              }
          }
          return d;
      }));
      setHasUnsavedChanges(true);
  };

  const handleSavePlan = () => {
    const validationResult = nutritionPlanSchema.safeParse({
      id: initialPlan?.id || crypto.randomUUID?.() || `nutrition-plan-${Date.now()}`,
      athleteId: athlete.id,
      name,
      startDate: initialPlan?.startDate || new Date().toISOString(),
      days,
      notes,
      created_at: initialPlan?.created_at || Date.now()
    });

    if (!validationResult.success) {
      // Extract and set validation errors
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach(issue => {
        // Convert path to string to use as index
        const field = Array.isArray(issue.path) && issue.path.length > 0 ? issue.path[0].toString() : 'general';
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    const plan: NutritionPlan = validationResult.data;
    onSave(plan);
    setErrors({}); // Clear errors after successful submission
  };

  const totalFoods = days.reduce((sum, d) => sum + d.meals.reduce((mSum, m) => mSum + m.foods.length, 0), 0);
  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-dark-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">طراحی رژیم غذایی</h2>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <span>ورزشکار: {athlete.fullName}</span>
            {totalFoods > 0 && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {days.length} روز • {totalMeals} وعده • {totalFoods} غذا
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => hasUnsavedChanges ? setShowExitConfirm(true) : onCancel()}>لغو</Button>
          <Button variant="ghost" onClick={() => setShowTemplateModal(true)}>قالب‌ها</Button>
          <Button variant="ghost" onClick={saveAsTemplate}>ذخیره قالب</Button>
          <Button onClick={handleSavePlan} className="flex gap-2 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
            <Save size={18} /> ذخیره برنامه
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        {/* Plan Name */}
        <div className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 space-y-4">
          <div>
            <Label className="text-base text-gray-800 dark:text-gray-200">عنوان برنامه غذایی</Label>
            <Input 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                setHasUnsavedChanges(true);
                if (errors.name) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.name;
                    return newErrors;
                  });
                }
              }}
              className={`text-lg font-bold mt-2 h-12 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label className="text-base text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <StickyNote size={18} />
              توضیحات
            </Label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="نکات روانشناختی، اهداف رژیم، محدودیت‌های غذایی..."
              className="w-full mt-2 p-3 rounded-2xl border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 focus:border-green-500 dark:text-white text-sm resize-none h-24 transition-all"
            />
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-4">
            {days.map((day, dIdx) => {
                const macros = calculateDayMacros(day);
                return (
                    <div key={day.id} className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden animate-slide-up" style={{ animationDelay: `${dIdx * 0.1}s` }}>
                        <div 
                            className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                            onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                                    <Utensils size={24} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <input 
                                        value={day.dayName}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setDays(prev => prev.map(d => d.id === day.id ? {...d, dayName: e.target.value} : d));
                                            setHasUnsavedChanges(true);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="font-black text-lg text-gray-800 dark:text-white bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none transition-all w-48 px-1"
                                    />
                                    <div className="flex gap-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Flame size={12} className="text-orange-500" /> 
                                            {Math.round(macros.cals)}{day.targetCalories ? `/${day.targetCalories}` : ''} کالری
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Activity size={12} className="text-blue-500" /> 
                                            P: {Math.round(macros.prot)}{day.targetProtein ? `/${day.targetProtein}` : ''}g
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Wheat size={12} className="text-amber-500" /> 
                                            C: {Math.round(macros.carb)}{day.targetCarbs ? `/${day.targetCarbs}` : ''}g
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Droplet size={12} className="text-purple-500" /> 
                                            F: {Math.round(macros.fat)}{day.targetFat ? `/${day.targetFat}` : ''}g
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteDay(day.id); }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                                {expandedDay === day.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                            </div>
                        </div>

                        {expandedDay === day.id && (
                            <div className="p-5 border-t border-gray-100 dark:border-dark-700 bg-gray-50/50 dark:bg-dark-900/20 space-y-6">
                                {/* Macro Targets */}
                                <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">اهداف روزانه</p>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-orange-500 block mb-1">کالری</label>
                                            <input
                                                type="number"
                                                value={day.targetCalories || ''}
                                                onChange={(e) => updateDayMacroTarget(day.id, 'targetCalories', Number(e.target.value))}
                                                className="w-full p-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 focus:outline-none focus:border-emerald-500"
                                                placeholder="هدف"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-blue-500 block mb-1">پروتئین</label>
                                            <input
                                                type="number"
                                                value={day.targetProtein || ''}
                                                onChange={(e) => updateDayMacroTarget(day.id, 'targetProtein', Number(e.target.value))}
                                                className="w-full p-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 focus:outline-none focus:border-emerald-500"
                                                placeholder="g"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-amber-500 block mb-1">کربوهیدرات</label>
                                            <input
                                                type="number"
                                                value={day.targetCarbs || ''}
                                                onChange={(e) => updateDayMacroTarget(day.id, 'targetCarbs', Number(e.target.value))}
                                                className="w-full p-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 focus:outline-none focus:border-emerald-500"
                                                placeholder="g"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-purple-500 block mb-1">چربی</label>
                                            <input
                                                type="number"
                                                value={day.targetFat || ''}
                                                onChange={(e) => updateDayMacroTarget(day.id, 'targetFat', Number(e.target.value))}
                                                className="w-full p-1.5 text-center text-xs rounded-lg border border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800 focus:outline-none focus:border-emerald-500"
                                                placeholder="g"
                                            />
                                        </div>
                                    </div>
                                    {/* Progress Bars */}
                                    {(day.targetCalories || day.targetProtein || day.targetCarbs || day.targetFat) && (
                                        <div className="mt-3 space-y-2">
                                            {day.targetCalories && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] w-12 text-gray-500">کالری</span>
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${getMacroPercentage(macros.cals, day.targetCalories) >= 90 ? 'bg-emerald-500' : 'bg-orange-500'}`} style={{ width: `${getMacroPercentage(macros.cals, day.targetCalories)}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] w-8 text-right ${getMacroColor(getMacroPercentage(macros.cals, day.targetCalories))}`}>{getMacroPercentage(macros.cals, day.targetCalories)}%</span>
                                                </div>
                                            )}
                                            {day.targetProtein && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] w-12 text-gray-500">پروتئین</span>
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${getMacroPercentage(macros.prot, day.targetProtein) >= 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${getMacroPercentage(macros.prot, day.targetProtein)}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] w-8 text-right ${getMacroColor(getMacroPercentage(macros.prot, day.targetProtein))}`}>{getMacroPercentage(macros.prot, day.targetProtein)}%</span>
                                                </div>
                                            )}
                                            {day.targetCarbs && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] w-12 text-gray-500">کربو</span>
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${getMacroPercentage(macros.carb, day.targetCarbs) >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${getMacroPercentage(macros.carb, day.targetCarbs)}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] w-8 text-right ${getMacroColor(getMacroPercentage(macros.carb, day.targetCarbs))}`}>{getMacroPercentage(macros.carb, day.targetCarbs)}%</span>
                                                </div>
                                            )}
                                            {day.targetFat && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] w-12 text-gray-500">چربی</span>
                                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${getMacroPercentage(macros.fat, day.targetFat) >= 90 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${getMacroPercentage(macros.fat, day.targetFat)}%` }} />
                                                    </div>
                                                    <span className={`text-[10px] w-8 text-right ${getMacroColor(getMacroPercentage(macros.fat, day.targetFat))}`}>{getMacroPercentage(macros.fat, day.targetFat)}%</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {day.meals.map((meal, mIdx) => (
                                    <div key={meal.id} className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-2xl overflow-hidden">
                                        <div className="bg-gray-100 dark:bg-dark-700 px-4 py-3 flex justify-between items-center">
                                            <input 
                                                value={meal.name}
                                                onChange={(e) => {
                                                    setDays(prev => prev.map(d => d.id === day.id ? {...d, meals: d.meals.map(m => m.id === meal.id ? {...m, name: e.target.value} : m)} : d));
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="bg-transparent font-bold text-gray-700 dark:text-gray-200 focus:outline-none border-b border-transparent focus:border-gray-400 w-32"
                                            />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={meal.time || ''}
                                                    onChange={(e) => {
                                                        setDays(prev => prev.map(d => d.id === day.id ? {...d, meals: d.meals.map(m => m.id === meal.id ? {...m, time: e.target.value || undefined} : m)} : d));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-dark-600 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                                <Button size="sm" variant="ghost" onClick={() => { setCurrentDayId(day.id); setCurrentMealId(meal.id); setIsFoodModalOpen(true); }} className="h-8 text-xs bg-white dark:bg-dark-800 shadow-sm border border-gray-200 dark:border-dark-600">
                                                    <Plus size={14} className="ml-1" /> افزودن غذا
                                                </Button>
                                                <button onClick={() => handleDeleteMeal(day.id, meal.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-dark-700">
                                            {meal.foods.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">غذایی اضافه نشده است</div>
                                            ) : (
                                                meal.foods.map(food => (
                                                    <div key={food.id} className="p-3 flex justify-between items-center hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group">
                                                        <div>
                                                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{food.name} <span className="text-gray-500 font-normal mx-1">({food.amount})</span></div>
                                                            <div className="text-[10px] text-gray-400 mt-0.5 flex gap-2">
                                                                <span>{food.calories} کالری</span>
                                                                <span>P: {food.protein}</span>
                                                                <span>C: {food.carbs}</span>
                                                                <span>F: {food.fat}</span>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleDeleteFood(day.id, meal.id, food.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={() => handleAddMeal(day.id)} className="w-full border-dashed border-2">
                                    <Plus size={16} className="ml-2" /> افزودن وعده غذایی جدید
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
            
            <Button 
                variant="ghost" 
                className="w-full border-2 border-dashed border-gray-300 dark:border-dark-600 py-6 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-dark-800 transition-all rounded-3xl"
                onClick={handleAddDay}
            >
                <Plus size={24} className="ml-2" /> افزودن روز جدید
            </Button>
        </div>
      </div>

      {/* Food Add Modal */}
      <Modal isOpen={isFoodModalOpen} onClose={() => { setIsFoodModalOpen(false); setFoodModalTab('library'); setFoodFormErrors({}); setSelectedFoodForPortion(null); setPortionAmount(''); setFoodCategoryFilter('All'); }} title="افزودن ماده غذایی">
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-dark-700">
              <button
                onClick={() => setFoodModalTab('library')}
                className={`pb-3 px-4 font-semibold transition-colors flex items-center gap-2 ${
                  foodModalTab === 'library'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                از کتابخانه
                {foodModalTab === 'library' && filteredLibraryFoods.length > 0 && (
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">
                    {filteredLibraryFoods.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFoodModalTab('custom')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  foodModalTab === 'custom'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                ورود دستی
              </button>
            </div>

            {/* Library Tab */}
            {foodModalTab === 'library' && (
              <div className="flex flex-col max-h-[500px]">
                {/* Portion Preset View */}
                {selectedFoodForPortion ? (
                  <div className="space-y-4 p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setSelectedFoodForPortion(null); setPortionAmount(''); }}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                      >
                        <RotateCcw size={18} className="text-gray-500" />
                      </button>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{selectedFoodForPortion.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">انتخاب مقدار</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600 dark:text-gray-400">مقدار سفارشی</Label>
                      <Input
                        value={portionAmount}
                        onChange={(e) => setPortionAmount(e.target.value)}
                        placeholder={selectedFoodForPortion.amount}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">انتخاب سریع</p>
                      <div className="flex flex-wrap gap-2">
                        {PORTION_PRESETS.map(preset => (
                          <button
                            key={preset}
                            onClick={() => setPortionAmount(preset)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              portionAmount === preset
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-dark-900 rounded-xl p-3 border border-gray-200 dark:border-dark-700">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>مقدار پیش‌فرض: {selectedFoodForPortion.amount}</span>
                        <span>{portionAmount || selectedFoodForPortion.amount}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAddFoodFromLibrary(selectedFoodForPortion, portionAmount || undefined)}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      افزودن به وعده
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Search + Filters (Sticky) */}
                    <div className="sticky top-0 z-10 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
                      <div className="p-4">
                        <div className="relative">
                          <Search
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                          <Input
                            type="text"
                            placeholder="جستجوی غذا..."
                            value={librarySearchQuery}
                            onChange={(e) => setLibrarySearchQuery(e.target.value)}
                            className="pr-10 h-10 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800"
                          />
                        </div>
                      </div>

                      {/* Category Chips */}
                      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {FOOD_CATEGORIES.map(cat => (
                          <button
                            key={cat.value}
                            onClick={() => setFoodCategoryFilter(cat.value)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              foodCategoryFilter === cat.value
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-600'
                            }`}
                          >
                            {cat.icon} {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Food List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {libraryLoading && (
                        <div className="space-y-3 py-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="p-3 bg-gray-100 dark:bg-dark-900 rounded-xl animate-pulse">
                              <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-1/3 mb-2"></div>
                              <div className="flex gap-3">
                                <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-12"></div>
                                <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-12"></div>
                                <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-12"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {!libraryLoading && filteredLibraryFoods.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Utensils size={40} className="text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {librarySearchQuery || foodCategoryFilter !== 'All' ? 'غذایی یافت نشد' : 'کتابخانه خالی است'}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {librarySearchQuery || foodCategoryFilter !== 'All' ? 'فیلترها را تغییر دهید' : 'از بخش کتابخانه غذا اضافه کنید'}
                          </p>
                          {(librarySearchQuery || foodCategoryFilter !== 'All') && (
                            <button
                              onClick={() => { setLibrarySearchQuery(''); setFoodCategoryFilter('All'); }}
                              className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            >
                              <RotateCcw size={14} /> پاک کردن فیلترها
                            </button>
                          )}
                        </div>
                      )}

                      {!libraryLoading && filteredLibraryFoods.length > 0 && (
                        <>
                          {/* Recently Used Section */}
                          {!librarySearchQuery && foodCategoryFilter === 'All' && recentFoodIds.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Clock size={14} className="text-gray-400" />
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">اخیراً استفاده شده</p>
                              </div>
                              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {recentFoodIds
                                  .map(id => libraryFoods.find(f => f.id === id))
                                  .filter(Boolean)
                                  .slice(0, 5)
                                  .map(item => (
                                    <button
                                      key={item!.id}
                                      onClick={() => handleAddFoodFromLibrary(item!)}
                                      className="shrink-0 p-2 bg-gray-50 dark:bg-dark-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-gray-200 dark:border-dark-700 transition-colors text-right min-w-[120px]"
                                    >
                                      <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{item!.name}</p>
                                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 flex gap-1">
                                        <span>{item!.calories} kcal</span>
                                        <span>•</span>
                                        <span>{item!.amount}</span>
                                      </div>
                                    </button>
                                  ))
                                }
                              </div>
                            </div>
                          )}

                          {/* Group by Category */}
                          {(() => {
                            const grouped: Record<string, FoodLibraryItem[]> = {};
                            filteredLibraryFoods.forEach(item => {
                              const cat = item.category || 'سایر';
                              if (!grouped[cat]) grouped[cat] = [];
                              grouped[cat].push(item);
                            });
                            return Object.keys(grouped).map(category => {
                              const items = grouped[category];
                              return (
                              <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{category}</p>
                                  <span className="text-[10px] bg-gray-200 dark:bg-dark-600 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full font-bold">
                                    {items.length}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {items.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => setSelectedFoodForPortion(item)}
                                    className="w-full text-right p-3 bg-gray-50 dark:bg-dark-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-gray-200 dark:border-dark-700 transition-colors group"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-800 dark:text-white text-sm truncate">{item.name}</span>
                                          {item.brand && (
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.brand}</span>
                                          )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex gap-2 flex-wrap">
                                          <span className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md">
                                            <Flame size={10} className="text-orange-500" /> {item.calories}
                                          </span>
                                          <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-md">
                                            <Activity size={10} className="text-blue-500" /> P: {item.protein}
                                          </span>
                                          <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                                            <Wheat size={10} className="text-amber-500" /> C: {item.carbs}
                                          </span>
                                          <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded-md">
                                            <Droplet size={10} className="text-purple-500" /> F: {item.fat}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                          {item.amount}{item.servingSize ? ` • ${item.servingSize}` : ''}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 ml-2">
                                        <Plus size={16} className="text-emerald-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                            });
                          })()}
                        </>
                      )}
                    </div>

                    {/* Session Macros Footer */}
                    {(sessionMacros.calories > 0 || sessionMacros.protein > 0 || sessionMacros.carbs > 0 || sessionMacros.fat > 0) && (
                      <div className="border-t border-gray-200 dark:border-dark-700 p-3 bg-gray-50 dark:bg-dark-900">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-500 dark:text-gray-400">این جلسه:</span>
                          <div className="flex gap-3">
                            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                              <Flame size={10} /> {Math.round(sessionMacros.calories)}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Activity size={10} /> P: {Math.round(sessionMacros.protein)}
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Wheat size={10} /> C: {Math.round(sessionMacros.carbs)}
                            </span>
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <Droplet size={10} /> F: {Math.round(sessionMacros.fat)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Custom Tab */}
            {foodModalTab === 'custom' && (
              <div className="space-y-4">
                <div>
                  <Label>نام غذا</Label>
                  <Input 
                    value={foodForm.name} 
                    onChange={e => {
                      setFoodForm({...foodForm, name: e.target.value});
                      if (foodFormErrors.name) setFoodFormErrors(prev => ({...prev, name: ''}));
                    }} 
                    placeholder="مثال: سینه مرغ آبپز" 
                    autoFocus 
                    className={foodFormErrors.name ? 'border-red-500' : ''}
                  />
                  {foodFormErrors.name && <p className="text-red-500 text-xs mt-1">{foodFormErrors.name}</p>}
                </div>
                <div>
                  <Label>مقدار / واحد</Label>
                  <Input 
                    value={foodForm.amount} 
                    onChange={e => {
                      setFoodForm({...foodForm, amount: e.target.value});
                      if (foodFormErrors.amount) setFoodFormErrors(prev => ({...prev, amount: ''}));
                    }} 
                    placeholder="مثال: 100 گرم / 1 لیوان" 
                    className={foodFormErrors.amount ? 'border-red-500' : ''}
                  />
                  {foodFormErrors.amount && <p className="text-red-500 text-xs mt-1">{foodFormErrors.amount}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>کالری</Label>
                      <Input type="number" value={foodForm.calories} onChange={e => {
                        setFoodForm({...foodForm, calories: Number(e.target.value)});
                        if (foodFormErrors.calories) setFoodFormErrors(prev => ({...prev, calories: ''}));
                      }} className={`text-center ${foodFormErrors.calories ? 'border-red-500' : ''}`} />
                      {foodFormErrors.calories && <p className="text-red-500 text-xs mt-1">{foodFormErrors.calories}</p>}
                  </div>
                  <div>
                      <Label>پروتئین (g)</Label>
                      <Input type="number" value={foodForm.protein} onChange={e => {
                        setFoodForm({...foodForm, protein: Number(e.target.value)});
                        if (foodFormErrors.protein) setFoodFormErrors(prev => ({...prev, protein: ''}));
                      }} className={`text-center ${foodFormErrors.protein ? 'border-red-500' : ''}`} />
                      {foodFormErrors.protein && <p className="text-red-500 text-xs mt-1">{foodFormErrors.protein}</p>}
                  </div>
                  <div>
                      <Label>کربوهیدرات (g)</Label>
                      <Input type="number" value={foodForm.carbs} onChange={e => {
                        setFoodForm({...foodForm, carbs: Number(e.target.value)});
                        if (foodFormErrors.carbs) setFoodFormErrors(prev => ({...prev, carbs: ''}));
                      }} className={`text-center ${foodFormErrors.carbs ? 'border-red-500' : ''}`} />
                      {foodFormErrors.carbs && <p className="text-red-500 text-xs mt-1">{foodFormErrors.carbs}</p>}
                  </div>
                  <div>
                      <Label>چربی (g)</Label>
                      <Input type="number" value={foodForm.fat} onChange={e => {
                        setFoodForm({...foodForm, fat: Number(e.target.value)});
                        if (foodFormErrors.fat) setFoodFormErrors(prev => ({...prev, fat: ''}));
                      }} className={`text-center ${foodFormErrors.fat ? 'border-red-500' : ''}`} />
                      {foodFormErrors.fat && <p className="text-red-500 text-xs mt-1">{foodFormErrors.fat}</p>}
                  </div>
                </div>
                <Button onClick={handleSaveFood} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white">افزودن به وعده</Button>
              </div>
            )}
          </div>
      </Modal>

      {/* Delete Day Confirmation Modal */}
      <Modal isOpen={!!dayToDelete} onClose={() => setDayToDelete(null)} title="حذف روز غذایی">
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
            <AlertTriangle size={28} />
            <div>
              <h4 className="font-bold text-lg">آیا مطمئن هستید؟</h4>
              <p className="text-sm mt-1 opacity-90">
                شما در حال حذف <strong>{days.find(d => d.id === dayToDelete)?.dayName}</strong> هستید. تمام وعده‌ها و غذاهای این روز حذف خواهند شد.
              </p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDayToDelete(null)}>انصراف</Button>
            <Button variant="danger" className="flex-1" onClick={confirmDeleteDay}>بله، حذف شود</Button>
          </div>
        </div>
      </Modal>

      {/* Template Modal */}
      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="قالب‌های ذخیره شده">
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Utensils size={40} className="mx-auto mb-3 opacity-30" />
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

      {/* Exit Dialog */}
      <Modal isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} title="خروج بدون ذخیره">
         <div className="space-y-6">
            <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
                <AlertTriangle size={28} />
                <div>
                    <h4 className="font-bold text-lg">تغییرات ذخیره نشده</h4>
                    <p className="text-sm mt-1 opacity-90">
                        شما تغییرات ذخیره نشده دارید. آیا می‌خواهید بدون ذخیره کردن خارج شوید؟
                    </p>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowExitConfirm(false)}>ادامه ویرایش</Button>
                <Button variant="danger" className="flex-1" onClick={onCancel}>خروج بدون ذخیره</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
