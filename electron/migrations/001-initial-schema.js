exports.up = function (db) {
  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Create tables with proper constraints
  db.exec(`
    -- Athletes table with proper constraints
    CREATE TABLE IF NOT EXISTS athletes (
      id TEXT PRIMARY KEY NOT NULL,
      fullName TEXT NOT NULL CHECK(length(fullName) > 0),
      phone TEXT,
      age INTEGER CHECK(age >= 13 AND age <= 120),
      height INTEGER CHECK(height >= 100 AND height <= 300),
      gender TEXT CHECK(gender IN ('Male', 'Female')),
      joinDate TEXT NOT NULL,
      measurements TEXT NOT NULL DEFAULT '[]',
      currentGoal TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Exercises table with constraints
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL CHECK(length(name) > 0),
      muscleGroup TEXT NOT NULL CHECK(length(muscleGroup) > 0),
      type TEXT CHECK(type IN ('Machine', 'Dumbbell', 'Barbell', 'Bodyweight', 'Cable')),
      notes TEXT,
      videoUrl TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Plans table with constraints
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL CHECK(length(name) > 0),
      athleteId TEXT,
      days TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
    );

    -- Nutrition plans table with constraints
    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL CHECK(length(name) > 0),
      athleteId TEXT,
      days TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
    );

    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_athletes_status ON athletes(status);
    CREATE INDEX IF NOT EXISTS idx_athletes_join_date ON athletes(joinDate);
    CREATE INDEX IF NOT EXISTS idx_plans_athlete ON plans(athleteId);
    CREATE INDEX IF NOT EXISTS idx_nutrition_athlete ON nutrition_plans(athleteId);
    CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscleGroup);
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
  `);

  // Only update timestamps if the columns exist (for backward compatibility)
  try {
    db.exec(`
      UPDATE athletes SET created_at = joinDate, updated_at = joinDate 
      WHERE created_at IS NULL OR updated_at IS NULL;
    `);
  } catch (error) {
    // Ignore error if columns don't exist (old schema)
  }
};

exports.down = function (db) {
  db.exec(`
    DROP TABLE IF EXISTS nutrition_plans;
    DROP TABLE IF EXISTS plans;
    DROP TABLE IF EXISTS exercises;
    DROP TABLE IF EXISTS athletes;
    DROP TABLE IF EXISTS settings;
  `);
};
