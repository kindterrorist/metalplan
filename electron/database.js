const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");
const fs = require("fs");
const crypto = require("crypto");
const MigrationRunner = require("./migrations/migration-runner");

// Database file location
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "metalplans.db");

// Ensure directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database with migrations
function initDatabase() {
  try {
    const migrationRunner = new MigrationRunner(db);
    migrationRunner.runAllPending();
    console.log("Database initialized with migrations at:", dbPath);
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Athletes CRUD
function getAllAthletes() {
  const stmt = db.prepare("SELECT * FROM athletes");
  const athletes = stmt.all();

  // Get measurements for each athlete from the new normalized table
  const updatedAthletes = athletes.map((a) => {
    const measurements = getAthleteMeasurements(a.id);
    return {
      ...a,
      measurements: measurements,
    };
  });

  return updatedAthletes;
}

function saveAthlete(athlete) {
  // First save to the main athletes table
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO athletes (id, fullName, phone, age, height, gender, joinDate, measurements, currentGoal, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    athlete.id,
    athlete.fullName,
    athlete.phone,
    athlete.age,
    athlete.height,
    athlete.gender,
    athlete.joinDate,
    JSON.stringify(athlete.measurements),
    athlete.currentGoal,
    athlete.status
  );

  // Then save/update measurements in the normalized table
  if (athlete.measurements && Array.isArray(athlete.measurements)) {
    // Delete existing measurements for this athlete
    const deleteStmt = db.prepare(
      "DELETE FROM athlete_measurements WHERE athlete_id = ?"
    );
    deleteStmt.run(athlete.id);

    // Insert new measurements
    const insertStmt = db.prepare(`
      INSERT INTO athlete_measurements (id, athlete_id, date, weight, body_fat, neck, shoulder, chest, arms, forearms, waist, hips, thighs, calves, mood, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const measurement of athlete.measurements) {
      insertStmt.run(
        measurement.id || crypto.randomBytes(16).toString("hex"),
        athlete.id,
        measurement.date,
        measurement.weight,
        measurement.bodyFat || null,
        measurement.neck || null,
        measurement.shoulder || null,
        measurement.chest || null,
        measurement.arms || null,
        measurement.forearms || null,
        measurement.waist || null,
        measurement.hips || null,
        measurement.thighs || null,
        measurement.calves || null,
        measurement.mood || null,
        measurement.notes || null
      );
    }
  }

  return athlete;
}

function getAthleteMeasurements(athleteId) {
  const stmt = db.prepare(`
    SELECT * FROM athlete_measurements 
    WHERE athlete_id = ? 
    ORDER BY date ASC
  `);
  const measurements = stmt.all(athleteId);
  return measurements;
}

function getPlanDays(planId) {
  const stmt = db.prepare(`
    SELECT * FROM plan_days 
    WHERE plan_id = ? 
    ORDER BY day_number ASC
  `);
  const days = stmt.all(planId);

  // Get exercises for each day
  const daysWithExercises = days.map((day) => {
    const exercises = getDayExercises(day.id);
    return {
      ...day,
      exercises: exercises,
      isRestDay: day.is_rest_day === 1,
    };
  });

  return daysWithExercises;
}

function getDayExercises(planDayId) {
  const stmt = db.prepare(`
    SELECT * FROM exercise_sets 
    WHERE plan_day_id = ? 
    ORDER BY order_number ASC
  `);
  return stmt.all(planDayId);
}

function deleteAthlete(id) {
  const stmt = db.prepare("DELETE FROM athletes WHERE id = ?");
  stmt.run(id);
}

// Exercises CRUD
function getAllExercises() {
  const stmt = db.prepare("SELECT * FROM exercises");
  return stmt.all();
}

function saveExercise(exercise) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO exercises (id, name, muscleGroup, type)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(exercise.id, exercise.name, exercise.muscleGroup, exercise.type);
  return exercise;
}

function deleteExercise(id) {
  const stmt = db.prepare("DELETE FROM exercises WHERE id = ?");
  stmt.run(id);
}

// Plans CRUD
function getAllPlans() {
  const stmt = db.prepare("SELECT * FROM plans");
  const plans = stmt.all();

  // Get days and exercises for each plan from the new normalized tables
  const updatedPlans = plans.map((p) => {
    const days = getPlanDays(p.id);
    return {
      ...p,
      days: days,
    };
  });

  return updatedPlans;
}

function savePlan(plan) {
  // First save to the main plans table
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO plans (id, name, athleteId, days, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    plan.id,
    plan.name,
    plan.athleteId,
    JSON.stringify(plan.days),
    plan.created_at || Date.now()
  );

  // Then save/update days and exercises in the normalized tables
  if (plan.days && Array.isArray(plan.days)) {
    // Delete existing days for this plan
    const deleteDaysStmt = db.prepare(
      "DELETE FROM plan_days WHERE plan_id = ?"
    );
    deleteDaysStmt.run(plan.id);

    // Insert new days and their exercises
    const insertDayStmt = db.prepare(`
      INSERT INTO plan_days (id, plan_id, day_name, day_number, is_rest_day)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertExerciseStmt = db.prepare(`
      INSERT INTO exercise_sets (id, plan_day_id, exercise_id, exercise_name, sets, reps, rest, notes, order_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < plan.days.length; i++) {
      const day = plan.days[i];
      const dayId = crypto.randomBytes(16).toString("hex");

      // Insert the day
      insertDayStmt.run(
        dayId,
        plan.id,
        day.dayName,
        i + 1,
        day.isRestDay ? 1 : 0
      );

      // Insert exercises for this day if it's not a rest day
      if (!day.isRestDay && day.exercises && Array.isArray(day.exercises)) {
        for (let j = 0; j < day.exercises.length; j++) {
          const exercise = day.exercises[j];
          insertExerciseStmt.run(
            exercise.id || crypto.randomBytes(16).toString("hex"),
            dayId,
            exercise.exerciseId || null,
            exercise.exerciseName,
            exercise.sets,
            exercise.reps,
            exercise.rest || null,
            exercise.notes || null,
            j + 1
          );
        }
      }
    }
  }

  return plan;
}

function deletePlan(id) {
  const stmt = db.prepare("DELETE FROM plans WHERE id = ?");
  stmt.run(id);
}

// Nutrition Plans CRUD
function getAllNutritionPlans() {
  const stmt = db.prepare("SELECT * FROM nutrition_plans");
  const plans = stmt.all();

  // Get days, meals, and food items for each nutrition plan from the new normalized tables
  const updatedPlans = plans.map((p) => {
    const days = getNutritionPlanDays(p.id);
    return {
      ...p,
      days: days,
    };
  });

  return updatedPlans;
}

function getNutritionPlanDays(nutritionPlanId) {
  const stmt = db.prepare(`
    SELECT * FROM nutrition_days 
    WHERE nutrition_plan_id = ? 
    ORDER BY day_number ASC
  `);
  const days = stmt.all(nutritionPlanId);

  // Get meals and food items for each day
  const daysWithMeals = days.map((day) => {
    const meals = getNutritionDayMeals(day.id);
    return {
      ...day,
      meals: meals,
    };
  });

  return daysWithMeals;
}

function getNutritionDayMeals(nutritionDayId) {
  const stmt = db.prepare(`
    SELECT * FROM meals 
    WHERE nutrition_day_id = ? 
    ORDER BY order_number ASC
  `);
  const meals = stmt.all(nutritionDayId);

  // Get food items for each meal
  const mealsWithFoodItems = meals.map((meal) => {
    const foodItems = getMealFoodItems(meal.id);
    return {
      ...meal,
      foods: foodItems,
    };
  });

  return mealsWithFoodItems;
}

function getMealFoodItems(mealId) {
  const stmt = db.prepare(`
    SELECT * FROM food_items 
    WHERE meal_id = ? 
    ORDER BY order_number ASC
  `);
  return stmt.all(mealId);
}

function saveNutritionPlan(plan) {
  // First save to the main nutrition_plans table
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO nutrition_plans (id, name, athleteId, days, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    plan.id,
    plan.name,
    plan.athleteId,
    JSON.stringify(plan.days),
    plan.created_at || Date.now()
  );

  // Then save/update days, meals, and food items in the normalized tables
  if (plan.days && Array.isArray(plan.days)) {
    // Delete existing days for this nutrition plan
    const deleteDaysStmt = db.prepare(
      "DELETE FROM nutrition_days WHERE nutrition_plan_id = ?"
    );
    deleteDaysStmt.run(plan.id);

    // Insert new days, meals, and food items
    const insertDayStmt = db.prepare(`
      INSERT INTO nutrition_days (id, nutrition_plan_id, day_name, day_number, target_calories, target_protein, target_carbs, target_fat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMealStmt = db.prepare(`
      INSERT INTO meals (id, nutrition_day_id, name, time, order_number)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertFoodItemStmt = db.prepare(`
      INSERT INTO food_items (id, meal_id, name, amount, calories, protein, carbs, fat, order_number)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 0; i < plan.days.length; i++) {
      const day = plan.days[i];
      const dayId = crypto.randomBytes(16).toString("hex");

      // Insert the day
      insertDayStmt.run(
        dayId,
        plan.id,
        day.dayName,
        i + 1,
        day.targetCalories || null,
        day.targetProtein || null,
        day.targetCarbs || null,
        day.targetFat || null
      );

      // Insert meals for this day if they exist
      if (day.meals && Array.isArray(day.meals)) {
        for (let j = 0; j < day.meals.length; j++) {
          const meal = day.meals[j];
          const mealId = crypto.randomBytes(16).toString("hex");

          // Insert the meal
          insertMealStmt.run(
            mealId,
            dayId,
            meal.name,
            meal.time || null,
            j + 1
          );

          // Insert food items for this meal if they exist
          if (meal.foods && Array.isArray(meal.foods)) {
            for (let k = 0; k < meal.foods.length; k++) {
              const food = meal.foods[k];
              insertFoodItemStmt.run(
                food.id || crypto.randomBytes(16).toString("hex"),
                mealId,
                food.name,
                food.amount,
                food.calories || null,
                food.protein || null,
                food.carbs || null,
                food.fat || null,
                k + 1
              );
            }
          }
        }
      }
    }
  }

  return plan;
}

function deleteNutritionPlan(id) {
  const stmt = db.prepare("DELETE FROM nutrition_plans WHERE id = ?");
  stmt.run(id);
}

// Trainer Profile
function getTrainerProfile() {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const result = stmt.get("trainer_profile");
  return result ? JSON.parse(result.value) : null;
}

function saveTrainerProfile(profile) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES (?, ?)
  `);

  stmt.run("trainer_profile", JSON.stringify(profile));
  return profile;
}

module.exports = {
  initDatabase,
  getAllAthletes,
  saveAthlete,
  deleteAthlete,
  getAllExercises,
  saveExercise,
  deleteExercise,
  getAllPlans,
  savePlan,
  deletePlan,
  getAllNutritionPlans,
  saveNutritionPlan,
  deleteNutritionPlan,
  getTrainerProfile,
  saveTrainerProfile,
};
