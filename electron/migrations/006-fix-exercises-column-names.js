exports.up = function (db) {
  // Create a new exercises table with correct snake_case column names
  db.exec(`
    -- Create temporary table with correct schema
    CREATE TABLE exercises_temp (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL CHECK(length(name) > 0),
      muscle_group TEXT NOT NULL CHECK(length(muscle_group) > 0),
      type TEXT CHECK(type IN ('Machine', 'Dumbbell', 'Barbell', 'Bodyweight', 'Cable')),
      notes TEXT,
      video_url TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Copy data from old table to new table, mapping camelCase to snake_case
    INSERT INTO exercises_temp (id, name, muscle_group, type, notes, video_url, description, created_at, updated_at)
    SELECT id, name, muscleGroup as muscle_group, type, notes, videoUrl as video_url, description, created_at, updated_at
    FROM exercises;

    -- Drop the old table
    DROP TABLE exercises;

    -- Rename the new table to exercises
    ALTER TABLE exercises_temp RENAME TO exercises;

    -- Recreate indexes for performance
    CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
  `);

  console.log(
    "Exercises table column names fixed from camelCase to snake_case"
  );
};

exports.down = function (db) {
  // Revert the changes - recreate original table with camelCase
  db.exec(`
    -- Create temporary table with original camelCase schema
    CREATE TABLE exercises_temp (
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

    -- Copy data back, mapping snake_case to camelCase
    INSERT INTO exercises_temp (id, name, muscleGroup, type, notes, videoUrl, description, created_at, updated_at)
    SELECT id, name, muscle_group as muscleGroup, type, notes, video_url as videoUrl, description, created_at, updated_at
    FROM exercises;

    -- Drop the snake_case table
    DROP TABLE exercises;

    -- Rename the original table back to exercises
    ALTER TABLE exercises_temp RENAME TO exercises;

    -- Recreate original indexes
    CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscleGroup);
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
  `);

  console.log(
    "Exercises table column names reverted from snake_case to camelCase"
  );
};
