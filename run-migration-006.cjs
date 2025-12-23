const Database = require("better-sqlite3");
const path = require("path");
const os = require("os");

// Get the user's database path
const userDataPath = path.join(
  os.homedir(),
  "AppData",
  "Roaming",
  "metalplans"
);
const dbPath = path.join(userDataPath, "metalplans.db");

console.log("Connecting to database at:", dbPath);

try {
  const db = new Database(dbPath);

  console.log("Checking current exercises table structure...");
  const exercisesCols = db.prepare("PRAGMA table_info(exercises)").all();
  console.log(
    "Current exercises table columns:",
    exercisesCols.map((c) => c.name)
  );

  const hasMuscleGroup = exercisesCols.some(
    (col) => col.name === "muscle_group"
  );
  const hasMuscleGroupOld = exercisesCols.some(
    (col) => col.name === "muscleGroup"
  );

  console.log("Has muscle_group column:", hasMuscleGroup);
  console.log("Has muscleGroup column:", hasMuscleGroupOld);

  if (hasMuscleGroup) {
    console.log(
      "Migration already applied - table already has muscle_group column"
    );
    db.close();
    process.exit(0);
  }

  if (!hasMuscleGroupOld) {
    console.log("ERROR: Neither muscleGroup nor muscle_group column exists!");
    db.close();
    process.exit(1);
  }

  console.log(
    "Applying migration 006 - renaming muscleGroup to muscle_group..."
  );

  // Begin transaction
  const tx = db.transaction(() => {
    // Create temporary table with correct schema
    db.exec(`
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
  });

  tx();

  console.log("Migration 006 applied successfully!");

  // Verify the result
  const newExercisesCols = db.prepare("PRAGMA table_info(exercises)").all();
  console.log(
    "New exercises table columns:",
    newExercisesCols.map((c) => c.name)
  );

  const hasNewColumn = newExercisesCols.some(
    (col) => col.name === "muscle_group"
  );
  console.log("Verification - has muscle_group column:", hasNewColumn);

  // Check if there's a migrations table and update it
  try {
    // Check if migrations table exists
    const migrationCheck = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'"
      )
      .get();
    if (migrationCheck) {
      // Check if migration 6 already exists
      const existingMigration = db
        .prepare("SELECT * FROM migrations WHERE version = 6")
        .get();
      if (!existingMigration) {
        console.log("Updating migrations table...");
        db.prepare("INSERT INTO migrations (version, name) VALUES (?, ?)").run(
          6,
          "fix-exercises-column-names"
        );
        console.log("Migrations table updated.");
      } else {
        console.log("Migration 6 already recorded in migrations table.");
      }
    } else {
      console.log("Migrations table doesn't exist in this database.");
    }
  } catch (e) {
    console.log("Could not update migrations table:", e.message);
  }

  db.close();
  console.log("Database connection closed.");
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
