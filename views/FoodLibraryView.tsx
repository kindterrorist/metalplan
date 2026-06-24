import React, { useState, useEffect, useCallback } from "react";
import { FoodLibraryItem } from "../types";
import {
  getFoodLibraryItems,
  saveFoodLibraryItem,
  deleteFoodLibraryItem,
  searchFoodLibrary,
} from "../services/electronDb";
import {
  Button,
  Input,
  Modal,
  Label,
  ConfirmDialog,
  Select,
} from "../components/UI";
import {
  Plus,
  Trash2,
  Save,
  X,
  Search,
  Edit3,
  Utensils,
  Tag,
  Package,
  Droplet,
  Flame,
  Activity,
  Wheat,
} from "lucide-react";
import { generateId } from "../utils/helpers";

const FoodLibraryViewComponent: React.FC = () => {
  const [items, setItems] = useState<FoodLibraryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodLibraryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodLibraryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Food form state - includes servingSize, brand, tags
  const [foodForm, setFoodForm] = useState<
    Omit<FoodLibraryItem, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    category: "",
    amount: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servingSize: "",
    brand: "",
    tags: [],
    notes: "",
  });

  // Food categories with icons
  const foodCategories = [
    { name: "پروتئین", icon: "🥩" },
    { name: "کربوهیدرات", icon: "🌾" },
    { name: "چربی", icon: "🫒" },
    { name: "میوه", icon: "🍎" },
    { name: "سبزیجات", icon: "🥦" },
    { name: "غلات", icon: "🍞" },
    { name: "لبنیات", icon: "🥛" },
    { name: "آجیل", icon: "🥜" },
    { name: "نوشیدنی", icon: "🥤" },
    { name: "سایر", icon: "📦" },
  ];

  // BUG-F2 FIX: Unified filter logic that applies both search and category together
  const applyFilters = useCallback(async (search: string, categories: string[]) => {
    try {
      let results: FoodLibraryItem[];

      if (search.trim() === "") {
        results = items;
      } else {
        results = await searchFoodLibrary(search);
      }

      // Apply category filter on top of search results
      if (categories.length > 0) {
        results = results.filter(
          (item) => item.category && categories.includes(item.category)
        );
      }

      setFilteredItems(results);
    } catch (err) {
      console.error("Error filtering food items:", err);
      setError("خطا در فیلتر کردن موارد غذایی");
    }
  }, [items]);

  // Load food library items
  useEffect(() => {
    loadFoodItems();
  }, []);

  // BUG-F2 FIX: Re-apply filters whenever search or categories change
  useEffect(() => {
    applyFilters(searchQuery, selectedCategories);
  }, [searchQuery, selectedCategories, items, applyFilters]);

  // PROBLEM-F5 FIX: Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadFoodItems = async () => {
    try {
      setLoading(true);
      const data = await getFoodLibraryItems();
      setItems(data);
      setFilteredItems(data);
      setError(null);
    } catch (err) {
      console.error("Error loading food items:", err);
      setError("خطا در بارگذاری موارد غذایی");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: FoodLibraryItem) => {
    setFormErrors({});
    if (item) {
      setEditingItem(item);
      setFoodForm({
        name: item.name,
        category: item.category || "",
        amount: item.amount,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        servingSize: item.servingSize || "",
        brand: item.brand || "",
        tags: item.tags || [],
        notes: item.notes || "",
      });
    } else {
      setEditingItem(null);
      setFoodForm({
        name: "",
        category: "",
        amount: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        servingSize: "",
        brand: "",
        tags: [],
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  // BUG-F3 FIX: Add validation before save
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!foodForm.name.trim()) errors.name = "نام غذا الزامی است";
    if (!foodForm.amount.trim()) errors.amount = "مقدار / واحد الزامی است";
    if (foodForm.calories < 0) errors.calories = "کالری نمی‌تواند منفی باشد";
    if (foodForm.protein < 0) errors.protein = "پروتئین نمی‌تواند منفی باشد";
    if (foodForm.carbs < 0) errors.carbs = "کربوهیدرات نمی‌تواند منفی باشد";
    if (foodForm.fat < 0) errors.fat = "چربی نمی‌تواند منفی باشد";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveFood = async () => {
    if (!validateForm()) return;

    try {
      const foodItem: FoodLibraryItem = {
        id: editingItem?.id || generateId(),
        ...foodForm,
        createdAt: editingItem?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await saveFoodLibraryItem(foodItem);
      await loadFoodItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving food item:", err);
      setError("خطا در ذخیره مورد غذایی");
    }
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await deleteFoodLibraryItem(id);
      await loadFoodItems();
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting food item:", err);
      setError("خطا در حذف مورد غذایی");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const calculateTotalMacros = () => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const totalMacros = calculateTotalMacros();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50/50 dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            در حال بارگذاری...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-dark-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Utensils className="text-emerald-600" size={28} />
            کتابخانه غذاها
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {filteredItems.length} مورد | {items.length} کل موارد
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => handleOpenModal()}
            className="flex gap-2 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
          >
            <Plus size={18} /> افزودن غذا
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        {/* Search Bar */}
        <div className="bg-white dark:bg-dark-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700">
          <div className="relative">
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="جستجوی نام غذا، دسته، برند، تگ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-12 h-12 bg-gray-50 dark:bg-dark-900 focus:bg-white dark:focus:bg-dark-800"
            />
          </div>
        </div>

        {/* Category Filters with icons */}
        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
            دسته‌بندی:
          </span>
          {foodCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => {
                if (selectedCategories.includes(category.name)) {
                  setSelectedCategories(
                    selectedCategories.filter((cat) => cat !== category.name)
                  );
                } else {
                  setSelectedCategories([...selectedCategories, category.name]);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedCategories.includes(category.name)
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600"
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button
              onClick={() => setSelectedCategories([])}
              className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50"
            >
              حذف فیلترها
            </button>
          )}
        </div>

        {/* Nutritional Summary Bar - FEATURE-F1 */}
        {filteredItems.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-4 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">جمع کل (نمای فعلی):</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-orange-500">
                  <Flame size={14} />
                  <span className="font-black text-lg">{Math.round(totalMacros.calories)}</span>
                </div>
                <span className="text-[10px] text-gray-500">کالری</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-blue-500">
                  <Activity size={14} />
                  <span className="font-black text-lg">{Math.round(totalMacros.protein)}</span>
                </div>
                <span className="text-[10px] text-gray-500">پروتئین</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  <Wheat size={14} />
                  <span className="font-black text-lg">{Math.round(totalMacros.carbs)}</span>
                </div>
                <span className="text-[10px] text-gray-500">کربو</span>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-purple-500">
                  <Droplet size={14} />
                  <span className="font-black text-lg">{Math.round(totalMacros.fat)}</span>
                </div>
                <span className="text-[10px] text-gray-500">چربی</span>
              </div>
            </div>
          </div>
        )}

        {/* Food Items List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Utensils
                size={48}
                className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
              />
              <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400">
                {searchQuery || selectedCategories.length > 0
                  ? "هیچ موردی یافت نشد"
                  : "غذایی در کتابخانه وجود ندارد"}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                {searchQuery
                  ? "جستجوی شما نتیجه‌ای نداشت"
                  : selectedCategories.length > 0
                  ? "موردی در این دسته‌بندی وجود ندارد"
                  : "اولین غذای خود را اضافه کنید"}
              </p>
              {(searchQuery || selectedCategories.length > 0) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories([]);
                  }}
                  className="mt-3"
                >
                  پاک کردن فیلترها
                </Button>
              )}
              {!searchQuery && selectedCategories.length === 0 && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus size={18} className="ml-2" /> افزودن اولین غذا
                </Button>
              )}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-dark-800 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-lg text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      {item.category && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                          {foodCategories.find(c => c.name === item.category)?.icon} {item.category}
                        </span>
                      )}
                      {item.brand && (
                        <span className="bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                          {item.brand}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Package size={12} /> {item.amount}
                      </span>
                      {item.servingSize && (
                        <span className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Package size={12} /> {item.servingSize}
                        </span>
                      )}
                      {item.tags && item.tags.length > 0 && item.tags.map((tag, idx) => (
                        <span key={idx} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-500" />
                        <span>{item.calories} کالری</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" />
                        <span>P: {item.protein}g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wheat size={16} className="text-amber-500" />
                        <span>C: {item.carbs}g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplet size={16} className="text-purple-500" />
                        <span>F: {item.fat}g</span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-900/50 p-2 rounded-xl">
                        {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mr-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Food Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "ویرایش غذا" : "افزودن غذای جدید"}
      >
        <div className="space-y-4">
          <div>
            <Label>نام غذا *</Label>
            <Input
              value={foodForm.name}
              onChange={(e) =>
                setFoodForm({ ...foodForm, name: e.target.value })
              }
              placeholder="مثال: سینه مرغ آبپز"
              autoFocus
              className={formErrors.name ? "border-red-500" : ""}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>دسته</Label>
              <Select
                value={foodForm.category}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, category: e.target.value })
                }
              >
                <option value="">انتخاب دسته</option>
                {foodCategories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>مقدار / واحد *</Label>
              <Input
                value={foodForm.amount}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, amount: e.target.value })
                }
                placeholder="مثال: 100 گرم / 1 عدد"
                className={formErrors.amount ? "border-red-500" : ""}
              />
              {formErrors.amount && (
                <p className="text-red-500 text-xs mt-1">{formErrors.amount}</p>
              )}
            </div>
          </div>

          {/* PROBLEM-F1 FIX: Add serving size and brand fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>اندازه سرو (اختیاری)</Label>
              <Input
                value={foodForm.servingSize || ""}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, servingSize: e.target.value })
                }
                placeholder="مثال: 1 پیمانه"
              />
            </div>
            <div>
              <Label>برند (اختیاری)</Label>
              <Input
                value={foodForm.brand || ""}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, brand: e.target.value })
                }
                placeholder="مثال: کاله"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>کالری</Label>
              <Input
                type="number"
                value={foodForm.calories}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, calories: Number(e.target.value) })
                }
                className={`text-center ${formErrors.calories ? "border-red-500" : ""}`}
                min="0"
              />
              {formErrors.calories && (
                <p className="text-red-500 text-xs mt-1">{formErrors.calories}</p>
              )}
            </div>
            <div>
              <Label>پروتئین (g)</Label>
              <Input
                type="number"
                value={foodForm.protein}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, protein: Number(e.target.value) })
                }
                className={`text-center ${formErrors.protein ? "border-red-500" : ""}`}
                min="0"
              />
              {formErrors.protein && (
                <p className="text-red-500 text-xs mt-1">{formErrors.protein}</p>
              )}
            </div>
            <div>
              <Label>کربوهیدرات (g)</Label>
              <Input
                type="number"
                value={foodForm.carbs}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, carbs: Number(e.target.value) })
                }
                className={`text-center ${formErrors.carbs ? "border-red-500" : ""}`}
                min="0"
              />
              {formErrors.carbs && (
                <p className="text-red-500 text-xs mt-1">{formErrors.carbs}</p>
              )}
            </div>
            <div>
              <Label>چربی (g)</Label>
              <Input
                type="number"
                value={foodForm.fat}
                onChange={(e) =>
                  setFoodForm({ ...foodForm, fat: Number(e.target.value) })
                }
                className={`text-center ${formErrors.fat ? "border-red-500" : ""}`}
                min="0"
              />
              {formErrors.fat && (
                <p className="text-red-500 text-xs mt-1">{formErrors.fat}</p>
              )}
            </div>
          </div>

          {/* FEATURE-F6: Auto-calculate calories from macros */}
          <div className="bg-gray-50 dark:bg-dark-900 p-3 rounded-xl text-center">
            <span className="text-xs text-gray-500">
              کالری محاسبه شده: {Math.round((foodForm.protein * 4) + (foodForm.carbs * 4) + (foodForm.fat * 9))} kcal
            </span>
          </div>

          <div>
            <Label>یادداشت‌ها</Label>
            <textarea
              value={foodForm.notes}
              onChange={(e) =>
                setFoodForm({ ...foodForm, notes: e.target.value })
              }
              placeholder="توضیحات اضافی درباره این غذا"
              className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSaveFood}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {editingItem ? "ذخیره تغییرات" : "افزودن به کتابخانه"}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف غذا"
        message="آیا از حذف این مورد غذایی اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        onConfirm={() => itemToDelete && handleDeleteFood(itemToDelete)}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        variant="danger"
      />

      {/* PROBLEM-F5 FIX: Error with close button and auto-dismiss */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-600 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export const FoodLibraryView = FoodLibraryViewComponent;

export default FoodLibraryViewComponent;
