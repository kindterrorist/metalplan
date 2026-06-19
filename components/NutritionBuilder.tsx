import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { nutritionPlanSchema } from '../src/utils/validationSchemas';
import { Athlete, NutritionPlan, DietDay, Meal, FoodItem, FoodLibraryItem } from '../types';
import { Button, Input, Modal, Label, Select } from './UI';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Utensils, AlertTriangle, Coffee, Flame, Droplet, Wheat, Activity, Search, StickyNote } from 'lucide-react';
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
  
  // Temporary Food Form State
  const [foodForm, setFoodForm] = useState<Partial<FoodItem>>({ name: '', amount: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // State for validation errors
 const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation State
 const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load food library items when modal opens
  useEffect(() => {
    if (isFoodModalOpen && foodModalTab === 'library') {
      loadLibraryFoods();
    }
  }, [isFoodModalOpen, foodModalTab]);

  // Filter library foods based on search query
  useEffect(() => {
    if (librarySearchQuery.trim() === '') {
      setFilteredLibraryFoods(libraryFoods);
    } else {
      const query = librarySearchQuery.toLowerCase();
      setFilteredLibraryFoods(
        libraryFoods.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query))
        )
      );
    }
  }, [librarySearchQuery, libraryFoods]);

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

  const handleAddFoodFromLibrary = (libraryFood: FoodLibraryItem) => {
    if (!currentDayId || !currentMealId) return;

    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: libraryFood.name,
      amount: libraryFood.amount,
      calories: libraryFood.calories,
      protein: libraryFood.protein,
      carbs: libraryFood.carbs,
      fat: libraryFood.fat,
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

    setHasUnsavedChanges(true);
    setIsFoodModalOpen(false);
    setFoodModalTab('library');
    setLibrarySearchQuery('');
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
      setDays(prev => prev.filter(d => d.id !== dayId));
      setHasUnsavedChanges(true);
  }

  const handleSaveFood = () => {
      if(!currentDayId || !currentMealId || !foodForm.name) return;
      
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
    // Validate the form data using Zod
    const validationResult = nutritionPlanSchema.safeParse({
      id: initialPlan?.id || crypto.randomUUID?.() || `nutrition-plan-${Date.now()}`,
      athleteId: athlete.id,
      name,
      startDate: new Date().toISOString(),
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

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-dark-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">طراحی رژیم غذایی</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">ورزشکار: {athlete.fullName}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => hasUnsavedChanges ? setShowExitConfirm(true) : onCancel()}>لغو</Button>
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
                                        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> {Math.round(macros.cals)} کالری</span>
                                        <span className="flex items-center gap-1"><Activity size={12} className="text-blue-500" /> P: {Math.round(macros.prot)}g</span>
                                        <span className="flex items-center gap-1"><Wheat size={12} className="text-amber-500" /> C: {Math.round(macros.carb)}g</span>
                                        <span className="flex items-center gap-1"><Droplet size={12} className="text-purple-500" /> F: {Math.round(macros.fat)}g</span>
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
                                            <div className="flex gap-2">
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
      <Modal isOpen={isFoodModalOpen} onClose={() => { setIsFoodModalOpen(false); setFoodModalTab('library'); }} title="افزودن ماده غذایی">
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-dark-700">
              <button
                onClick={() => setFoodModalTab('library')}
                className={`pb-3 px-4 font-semibold transition-colors ${
                  foodModalTab === 'library'
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                از کتابخانه
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
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

                {libraryLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                )}

                {!libraryLoading && filteredLibraryFoods.length === 0 && (
                  <div className="text-center py-6">
                    <Utensils size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {librarySearchQuery ? 'غذایی یافت نشد' : 'کتابخانه خالی است'}
                    </p>
                  </div>
                )}

                {!libraryLoading && filteredLibraryFoods.length > 0 && (
                  <div className="space-y-2">
                    {filteredLibraryFoods.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddFoodFromLibrary(item)}
                        className="w-full text-right p-3 bg-gray-50 dark:bg-dark-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-gray-200 dark:border-dark-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 dark:text-white">{item.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-2">
                              <span className="flex items-center gap-1"><Flame size={10} className="text-orange-500" /> {item.calories}</span>
                              <span className="flex items-center gap-1"><Activity size={10} className="text-blue-500" /> P: {item.protein}</span>
                              <span className="flex items-center gap-1"><Wheat size={10} className="text-amber-500" /> C: {item.carbs}</span>
                              <span className="flex items-center gap-1"><Droplet size={10} className="text-purple-500" /> F: {item.fat}</span>
                            </div>
                          </div>
                          <Plus size={16} className="text-emerald-600 ml-2 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
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
                    onChange={e => setFoodForm({...foodForm, name: e.target.value})} 
                    placeholder="مثال: سینه مرغ آبپز" 
                    autoFocus 
                  />
                </div>
                <div>
                  <Label>مقدار / واحد</Label>
                  <Input 
                    value={foodForm.amount} 
                    onChange={e => setFoodForm({...foodForm, amount: e.target.value})} 
                    placeholder="مثال: 100 گرم / 1 لیوان" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label>کالری</Label>
                      <Input type="number" value={foodForm.calories} onChange={e => setFoodForm({...foodForm, calories: Number(e.target.value)})} className="text-center" />
                  </div>
                  <div>
                      <Label>پروتئین (g)</Label>
                      <Input type="number" value={foodForm.protein} onChange={e => setFoodForm({...foodForm, protein: Number(e.target.value)})} className="text-center" />
                  </div>
                  <div>
                      <Label>کربوهیدرات (g)</Label>
                      <Input type="number" value={foodForm.carbs} onChange={e => setFoodForm({...foodForm, carbs: Number(e.target.value)})} className="text-center" />
                  </div>
                  <div>
                      <Label>چربی (g)</Label>
                      <Input type="number" value={foodForm.fat} onChange={e => setFoodForm({...foodForm, fat: Number(e.target.value)})} className="text-center" />
                  </div>
                </div>
                <Button onClick={handleSaveFood} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white">افزودن به وعده</Button>
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
