import { z } from "zod";

// Reusable validation constants
const MIN_AGE = 1;
const MAX_AGE = 120;
const MIN_HEIGHT = 50; // cm
const MAX_HEIGHT = 250; // cm
const MIN_WEIGHT = 20; // kg
const MAX_WEIGHT = 300; // kg

// Athlete schema
export const athleteSchema = z.object({
  id: z.string().min(1, "ID الزامی است"),
  fullName: z
    .string()
    .min(2, "نام باید حداقل 2 کاراکتر باشد")
    .max(100, "نام نباید بیشتر از 100 کاراکتر باشد"),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "شماره تماس نامعتبر است")
    .optional()
    .or(z.literal("")),
  age: z
    .number()
    .int("سن باید یک عدد صحیح باشد")
    .min(MIN_AGE, `سن باید بین ${MIN_AGE} و ${MAX_AGE} باشد`)
    .max(MAX_AGE, `سن باید بین ${MIN_AGE} و ${MAX_AGE} باشد`),
  height: z
    .number()
    .int("قد باید یک عدد صحیح باشد")
    .min(MIN_HEIGHT, `قد باید بین ${MIN_HEIGHT} و ${MAX_HEIGHT} سانتی‌متر باشد`)
    .max(
      MAX_HEIGHT,
      `قد باید بین ${MIN_HEIGHT} و ${MAX_HEIGHT} سانتی‌متر باشد`
    ),
  gender: z.enum(["Male", "Female"], {
    error: "جنسیت باید مرد یا زن باشد",
  }),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ عضویت نامعتبر است"),
  measurements: z
    .array(
      z.object({
        date: z.string().datetime("تاریخ اندازه‌گیری نامعتبر است"),
        weight: z
          .number()
          .min(
            MIN_WEIGHT,
            `وزن باید بین ${MIN_WEIGHT} و ${MAX_WEIGHT} کیلوگرم باشد`
          )
          .max(
            MAX_WEIGHT,
            `وزن باید بین ${MIN_WEIGHT} و ${MAX_WEIGHT} کیلوگرم باشد`
          ),
        bodyFat: z
          .number()
          .min(0, "درصد چربی بدن نمی‌تواند منفی باشد")
          .max(100, "درصد چربی بدن نمی‌تواند بیشتر از 100 باشد")
          .optional(),
        neck: z.number().positive("اندازه گردن باید مثبت باشد").optional(),
        shoulder: z.number().positive("اندازه شانه باید مثبت باشد").optional(),
        chest: z
          .number()
          .positive("اندازه قفسه سینه باید مثبت باشد")
          .optional(),
        arms: z.number().positive("اندازه بازو باید مثبت باشد").optional(),
        forearms: z
          .number()
          .positive("اندازه پیش‌بازو باید مثبت باشد")
          .optional(),
        waist: z.number().positive("اندازه کمر باید مثبت باشد").optional(),
        hips: z.number().positive("اندازه لگن باید مثبت باشد").optional(),
        thighs: z.number().positive("اندازه ران باید مثبت باشد").optional(),
        calves: z.number().positive("اندازه ساق باید مثبت باشد").optional(),
        photos: z
          .object({
            front: z.string().url("URL تصویر جلو نامعتبر است").optional(),
            side: z.string().url("URL تصویر کنار نامعتبر است").optional(),
            back: z.string().url("URL تصویر پشت نامعتبر است").optional(),
          })
          .optional(),
        notes: z
          .string()
          .max(500, "یادداشت نباید بیشتر از 500 کاراکتر باشد")
          .optional(),
        mood: z.number().int().min(1).max(5).optional(),
      })
    )
    .optional()
    .default([]),
  currentGoal: z
    .string()
    .max(200, "هدف نباید بیشتر از 200 کاراکتر باشد")
    .optional(),
  status: z.enum(["active", "archived"]).optional().default("active"),
});

export type AthleteValidationType = z.infer<typeof athleteSchema>;

// Exercise schema
export const exerciseSchema = z.object({
  id: z.string().min(1, "ID الزامی است"),
  name: z
    .string()
    .min(2, "نام حرکت باید حداقل 2 کاراکتر باشد")
    .max(100, "نام حرکت نباید بیشتر از 100 کاراکتر باشد"),
  muscleGroup: z
    .string()
    .min(2, "گروه عضلانی باید حداقل 2 کاراکتر باشد")
    .max(50, "گروه عضلانی نباید بیشتر از 50 کاراکتر باشد"),
  type: z.enum(["Machine", "Dumbbell", "Barbell", "Bodyweight", "Cable"]),
  notes: z
    .string()
    .max(500, "یادداشت نباید بیشتر از 500 کاراکتر باشد")
    .optional(),
  videoUrl: z.string().url("آدرس ویدیو نامعتبر است").optional(),
  description: z
    .string()
    .max(1000, "توضیحات نباید بیشتر از 100 کاراکتر باشد")
    .optional(),
});

export type ExerciseValidationType = z.infer<typeof exerciseSchema>;

// Exercise Set schema
export const exerciseSetSchema = z.object({
  exerciseId: z.string().min(1, "ID حرکت الزامی است"),
  exerciseName: z.string().min(1, "نام حرکت الزامی است"),
  sets: z
    .string()
    .min(1, "تعداد ست‌ها الزامی است")
    .regex(/^\d+(-\d+)?$/, "فرمت ست‌ها نامعتبر است (مثلاً 3 یا 3-4)"),
  reps: z
    .string()
    .min(1, "تعداد تکرارها الزامی است")
    .regex(
      /^\d+(-\d+)?|Failure$/,
      "فرمت تکرارها نامعتبر است (مثلاً 12، 12-15 یا Failure)"
    ),
  rest: z
    .string()
    .max(20, "زمان استراحت نباید بیشتر از 20 کاراکتر باشد")
    .optional(),
  notes: z
    .string()
    .max(200, "یادداشت نباید بیشتر از 200 کاراکتر باشد")
    .optional(),
});

export type ExerciseSetValidationType = z.infer<typeof exerciseSetSchema>;

// Workout Day schema
export const workoutDaySchema = z.object({
  id: z.string().min(1, "ID روز الزامی است"),
  dayName: z
    .string()
    .min(2, "نام روز باید حداقل 2 کاراکتر باشد")
    .max(50, "نام روز نباید بیشتر از 50 کاراکتر باشد"),
  exercises: z.array(exerciseSetSchema),
  isRestDay: z.boolean().optional().default(false),
});

export type WorkoutDayValidationType = z.infer<typeof workoutDaySchema>;

// Workout Plan schema
export const workoutPlanSchema = z.object({
  id: z.string().min(1, "ID الزامی است"),
  athleteId: z.string().min(1, "ID ورزشکار الزامی است"),
  name: z
    .string()
    .min(2, "نام برنامه باید حداقل 2 کاراکتر باشد")
    .max(100, "نام برنامه نباید بیشتر از 100 کاراکتر باشد"),
  startDate: z.string().datetime("تاریخ شروع نامعتبر است"),
  days: z.array(workoutDaySchema).min(1, "حداقل یک روز الزامی است"),
  notes: z
    .string()
    .max(1000, "یادداشت نباید بیشتر از 1000 کاراکتر باشد")
    .optional(),
  created_at: z.number().int().positive("زمان ایجاد الزامی است"),
});

export type WorkoutPlanValidationType = z.infer<typeof workoutPlanSchema>;

// Food Item schema
export const foodItemSchema = z.object({
  id: z.string().min(1, "ID غذا الزامی است"),
  name: z
    .string()
    .min(2, "نام غذا باید حداقل 2 کاراکتر باشد")
    .max(100, "نام غذا نباید بیشتر از 100 کاراکتر باشد"),
  amount: z
    .string()
    .min(2, "مقدار الزامی است")
    .max(50, "مقدار نباید بیشتر از 50 کاراکتر باشد"),
  calories: z.number().nonnegative("کالری نمی‌تواند منفی باشد"),
  protein: z.number().nonnegative("پروتئین نمی‌تواند منفی باشد"),
  carbs: z.number().nonnegative("کربوهیدرات نمی‌تواند منفی باشد"),
  fat: z.number().nonnegative("چربی نمی‌تواند منفی باشد"),
});

export type FoodItemValidationType = z.infer<typeof foodItemSchema>;

// Food Library Item schema
export const foodLibraryItemSchema = z.object({
  id: z.string().min(1, "ID الزامی است"),
  name: z
    .string()
    .min(2, "نام غذا باید حداقل 2 کاراکتر باشد")
    .max(100, "نام غذا نباید بیشتر از 100 کاراکتر باشد"),
  category: z
    .string()
    .min(2, "دسته بندی الزامی است")
    .max(50, "دسته بندی نباید بیشتر از 50 کاراکتر باشد")
    .optional(),
  amount: z
    .string()
    .min(2, "مقدار الزامی است")
    .max(50, "مقدار نباید بیشتر از 50 کاراکتر باشد"),
  calories: z.number().nonnegative("کالری نمی‌تواند منفی باشد"),
  protein: z.number().nonnegative("پروتئین نمی‌تواند منفی باشد"),
  carbs: z.number().nonnegative("کربوهیدرات نمی‌تواند منفی باشد"),
  fat: z.number().nonnegative("چربی نمی‌تواند منفی باشد"),
  servingSize: z
    .string()
    .max(50, "سایز سرو نباید بیشتر از 50 کاراکتر باشد")
    .optional(),
  brand: z
    .string()
    .max(100, "نام برند نباید بیشتر از 100 کاراکتر باشد")
    .optional(),
  tags: z.array(z.string()).optional().default([]),
  notes: z
    .string()
    .max(500, "یادداشت نباید بیشتر از 500 کاراکتر باشد")
    .optional(),
  createdAt: z.number().int().positive("زمان ایجاد الزامی است"),
  updatedAt: z.number().int().positive("زمان بروزرسانی الزامی است"),
});

export type FoodLibraryItemValidationType = z.infer<
  typeof foodLibraryItemSchema
>;

// Meal schema
export const mealSchema = z.object({
  id: z.string().min(1, "ID وعده الزامی است"),
  name: z
    .string()
    .min(2, "نام وعده باید حداقل 2 کاراکتر باشد")
    .max(50, "نام وعده نباید بیشتر از 50 کاراکتر باشد"),
  foods: z.array(foodItemSchema),
  time: z.string().max(20, "زمان نباید بیشتر از 20 کاراکتر باشد").optional(),
});

export type MealValidationType = z.infer<typeof mealSchema>;

// Diet Day schema
export const dietDaySchema = z.object({
  id: z.string().min(1, "ID روز الزامی است"),
  dayName: z
    .string()
    .min(2, "نام روز باید حداقل 2 کاراکتر باشد")
    .max(50, "نام روز نباید بیشتر از 50 کاراکتر باشد"),
  meals: z.array(mealSchema),
  targetCalories: z.number().positive("هدف کالری باید مثبت باشد").optional(),
  targetProtein: z.number().positive("هدف پروتئین باید مثبت باشد").optional(),
  targetCarbs: z.number().positive("هدف کربوهیدرات باید مثبت باشد").optional(),
  targetFat: z.number().positive("هدف چربی باید مثبت باشد").optional(),
});

export type DietDayValidationType = z.infer<typeof dietDaySchema>;

// Nutrition Plan schema
export const nutritionPlanSchema = z.object({
  id: z.string().min(1, "ID الزامی است"),
  athleteId: z.string().min(1, "ID ورزشکار الزامی است"),
  name: z
    .string()
    .min(2, "نام برنامه باید حداقل 2 کاراکتر باشد")
    .max(100, "نام برنامه نباید بیشتر از 100 کاراکتر باشد"),
  startDate: z.string().datetime("تاریخ شروع نامعتبر است"),
  days: z.array(dietDaySchema).min(1, "حداقل یک روز الزامی است"),
  notes: z
    .string()
    .max(1000, "یادداشت نباید بیشتر از 1000 کاراکتر باشد")
    .optional(),
  created_at: z.number().int().positive("زمان ایجاد الزامی است"),
});

export type NutritionPlanValidationType = z.infer<typeof nutritionPlanSchema>;

// Export Config schema
export const exportConfigSchema = z.object({
  theme: z.enum(["modern", "minimal", "dark", "bold"]),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "رنگ نامعتبر است"),
  showTrainerInfo: z.boolean(),
  showSlogan: z.boolean(),
  showSignature: z.boolean(),
  showQuote: z.boolean(),
  backgroundPattern: z.enum(["none", "dots", "grid", "waves", "custom"]),
  customBackgroundImage: z
    .string()
    .url("URL تصویر پس‌زمینه نامعتبر است")
    .optional(),
  includePhotos: z.boolean().optional(),
  photoAngles: z.array(z.enum(["front", "side", "back"])).optional(),
  photoSelectionMode: z.enum(["first_last", "latest", "all"]).optional(),
});
export type ExportConfigValidationType = z.infer<typeof exportConfigSchema>;
