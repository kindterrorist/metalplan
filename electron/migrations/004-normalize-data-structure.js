exports.up = function (db) {
  // Create normalized tables for better structure
  db.exec(`
    -- Create athlete_measurements table
    CREATE TABLE IF NOT EXISTS athlete_measurements (
      id TEXT PRIMARY KEY NOT NULL,
      athlete_id TEXT NOT NULL,
      date TEXT NOT NULL,
      weight REAL NOT NULL,
      body_fat REAL,
      neck REAL,
      shoulder REAL,
      chest REAL,
      arms REAL,
      forearms REAL,
      waist REAL,
      hips REAL,
      thighs REAL,
      calves REAL,
      mood INTEGER CHECK(mood >= 1 AND mood <= 5),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
    );

    -- Create plan_days table
    CREATE TABLE IF NOT EXISTS plan_days (
      id TEXT PRIMARY KEY NOT NULL,
      plan_id TEXT NOT NULL,
      day_name TEXT NOT NULL,
      day_number INTEGER,
      is_rest_day BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
    );

    -- Create exercise_sets table
    CREATE TABLE IF NOT EXISTS exercise_sets (
      id TEXT PRIMARY KEY NOT NULL,
      plan_day_id TEXT NOT NULL,
      exercise_id TEXT,
      exercise_name TEXT NOT NULL,
      sets TEXT,
      reps TEXT,
      rest TEXT,
      notes TEXT,
      order_number INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_day_id) REFERENCES plan_days(id) ON DELETE CASCADE,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
    );

    -- Create nutrition_days table
    CREATE TABLE IF NOT EXISTS nutrition_days (
      id TEXT PRIMARY KEY NOT NULL,
      nutrition_plan_id TEXT NOT NULL,
      day_name TEXT NOT NULL,
      day_number INTEGER,
      target_calories INTEGER,
      target_protein REAL,
      target_carbs REAL,
      target_fat REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nutrition_plan_id) REFERENCES nutrition_plans(id) ON DELETE CASCADE
    );

    -- Create meals table
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY NOT NULL,
      nutrition_day_id TEXT NOT NULL,
      name TEXT NOT NULL,
      time TEXT,
      order_number INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nutrition_day_id) REFERENCES nutrition_days(id) ON DELETE CASCADE
    );

    -- Create food_items table
    CREATE TABLE IF NOT EXISTS food_items (
      id TEXT PRIMARY KEY NOT NULL,
      meal_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount TEXT,
      calories INTEGER,
      protein REAL,
      carbs REAL,
      fat REAL,
      order_number INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
    );

    -- Create workout_logs table for tracking completion
    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY NOT NULL,
      athlete_id TEXT NOT NULL,
      plan_id TEXT,
      plan_day_id TEXT,
      date TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL,
      FOREIGN KEY (plan_day_id) REFERENCES plan_days(id) ON DELETE SET NULL
    );

    -- Create personal_records table
    CREATE TABLE IF NOT EXISTS personal_records (
      id TEXT PRIMARY KEY NOT NULL,
      athlete_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      weight REAL,
      reps INTEGER,
      date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
    );

    -- Create goals table
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL,
      athlete_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target REAL,
      current REAL DEFAULT 0,
      unit TEXT NOT NULL,
      deadline TEXT,
      achieved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
    );

    -- Create audit_log table for tracking changes
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('INSERT', 'UPDATE', 'DELETE')),
      old_values TEXT,
      new_values TEXT,
      user_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_athlete_measurements_athlete_date ON athlete_measurements(athlete_id, date);
    CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON plan_days(plan_id);
    CREATE INDEX IF NOT EXISTS idx_exercise_sets_plan_day ON exercise_sets(plan_day_id);
    CREATE INDEX IF NOT EXISTS idx_nutrition_days_plan ON nutrition_days(nutrition_plan_id);
    CREATE INDEX IF NOT EXISTS idx_meals_nutrition_day ON meals(nutrition_day_id);
    CREATE INDEX IF NOT EXISTS idx_workout_logs_athlete_date ON workout_logs(athlete_id, date);
    CREATE INDEX IF NOT EXISTS idx_personal_records_athlete_exercise ON personal_records(athlete_id, exercise_name);
    CREATE INDEX IF NOT EXISTS idx_goals_athlete_status ON goals(athlete_id, achieved);
  `);

  // Migrate existing data from JSON to new normalized tables
  migrateExistingData(db);
};

exports.down = function (db) {
  // Drop the new tables (data will be lost, but this is acceptable for rollback)
  db.exec(`
    DROP TABLE IF EXISTS food_items;
    DROP TABLE IF EXISTS meals;
    DROP TABLE IF EXISTS nutrition_days;
    DROP TABLE IF EXISTS exercise_sets;
    DROP TABLE IF EXISTS plan_days;
    DROP TABLE IF EXISTS athlete_measurements;
    DROP TABLE IF EXISTS workout_logs;
    DROP TABLE IF EXISTS personal_records;
    DROP TABLE IF EXISTS goals;
    DROP TABLE IF EXISTS audit_log;

    DROP INDEX IF EXISTS idx_athlete_measurements_athlete_date;
    DROP INDEX IF EXISTS idx_plan_days_plan;
    DROP INDEX IF EXISTS idx_exercise_sets_plan_day;
    DROP INDEX IF EXISTS idx_nutrition_days_plan;
    DROP INDEX IF EXISTS idx_meals_nutrition_day;
    DROP INDEX IF EXISTS idx_workout_logs_athlete_date;
    DROP INDEX IF EXISTS idx_personal_records_athlete_exercise;
    DROP INDEX IF EXISTS idx_goals_athlete_status;
  `);
};

function migrateExistingData(db) {
  // Migrate athlete measurements from JSON to normalized table
  const athletes = db.prepare("SELECT id, measurements FROM athletes").all();

  for (const athlete of athletes) {
    if (athlete.measurements && athlete.measurements !== "[]") {
      try {
        const measurements = JSON.parse(athlete.measurements);
        for (const measurement of measurements) {
          db.prepare(
            `
            INSERT INTO athlete_measurements (id, athlete_id, date, weight, body_fat, neck, shoulder, chest, arms, forearms, waist, hips, thighs, calves, mood, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
          ).run(
            generateId(),
            athlete.id,
            measurement.date,
            measurement.weight,
            measurement.bodyFat,
            measurement.neck,
            measurement.shoulder,
            measurement.chest,
            measurement.arms,
            measurement.forearms,
            measurement.waist,
            measurement.hips,
            measurement.thighs,
            measurement.calves,
            measurement.mood,
            measurement.notes
          );
        }
      } catch (error) {
        console.error("Error migrating athlete measurements:", error);
      }
    }
  }

  // Migrate workout plans from JSON to normalized tables
  const plans = db.prepare("SELECT id, athleteId, days FROM plans").all();

  for (const plan of plans) {
    if (plan.days && plan.days !== "[]") {
      try {
        const days = JSON.parse(plan.days);
        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const dayId = generateId();

          db.prepare(
            `
            INSERT INTO plan_days (id, plan_id, day_name, day_number, is_rest_day)
            VALUES (?, ?, ?, ?, ?)
          `
          ).run(dayId, plan.id, day.dayName, i + 1, day.isRestDay ? 1 : 0);

          // Insert exercises for this day if it's not a rest day
          if (day.exercises && !day.isRestDay) {
            for (let j = 0; j < day.exercises.length; j++) {
              const exercise = day.exercises[j];
              db.prepare(
                `
                INSERT INTO exercise_sets (id, plan_day_id, exercise_name, sets, reps, rest, notes, order_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `
              ).run(
                generateId(),
                dayId,
                exercise.exerciseName,
                exercise.sets,
                exercise.reps,
                exercise.rest,
                exercise.notes,
                j + 1
              );
            }
          }
        }
      } catch (error) {
        console.error("Error migrating plan days:", error);
      }
    }
  }

  // Migrate nutrition plans from JSON to normalized tables
  const nutritionPlans = db
    .prepare("SELECT id, athleteId, days FROM nutrition_plans")
    .all();

  for (const plan of nutritionPlans) {
    if (plan.days && plan.days !== "[]") {
      try {
        const days = JSON.parse(plan.days);
        for (let i = 0; i < days.length; i++) {
          const day = days[i];
          const dayId = generateId();

          db.prepare(
            `
            INSERT INTO nutrition_days (id, nutrition_plan_id, day_name, day_number, target_calories, target_protein, target_carbs, target_fat)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `
          ).run(
            dayId,
            plan.id,
            day.dayName,
            i + 1,
            day.targetCalories,
            day.targetProtein,
            day.targetCarbs,
            day.targetFat
          );

          // Insert meals for this day
          if (day.meals) {
            for (let j = 0; j < day.meals.length; j++) {
              const meal = day.meals[j];
              const mealId = generateId();

              db.prepare(
                `
                INSERT INTO meals (id, nutrition_day_id, name, time, order_number)
                VALUES (?, ?, ?, ?, ?)
              `
              ).run(mealId, dayId, meal.name, meal.time, j + 1);

              // Insert food items for this meal
              if (meal.foods) {
                for (let k = 0; k < meal.foods.length; k++) {
                  const food = meal.foods[k];
                  db.prepare(
                    `
                    INSERT INTO food_items (id, meal_id, name, amount, calories, protein, carbs, fat, order_number)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                  `
                  ).run(
                    generateId(),
                    mealId,
                    food.name,
                    food.amount,
                    food.calories,
                    food.protein,
                    food.carbs,
                    food.fat,
                    k + 1
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error migrating nutrition days:", error);
      }
    }
  }
}

// Simple ID generator for older Node versions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
