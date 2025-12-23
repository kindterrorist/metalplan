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

console.log("Checking database at:", dbPath);

try {
  const db = new Database(dbPath);

  // Check if migrations table exists and what's in it
  try {
    const migrations = db
      .prepare("SELECT * FROM migrations ORDER BY version")
      .all();
    console.log("Migrations in database:", migrations);
  } catch (e) {
    console.log("Migrations table does not exist or error:", e.message);
  }

  // Check exercises table structure
  try {
    const exercisesCols = db.prepare("PRAGMA table_info(exercises)").all();
    console.log(
      "Exercises table columns:",
      exercisesCols.map((c) => ({
        name: c.name,
        type: c.type,
        notnull: c.notnull,
        dflt_value: c.dflt_value,
      }))
    );

    const hasMuscleGroup = exercisesCols.some(
      (col) => col.name === "muscle_group"
    );
    const hasMuscleGroupOld = exercisesCols.some(
      (col) => col.name === "muscleGroup"
    );

    console.log("Has muscle_group column:", hasMuscleGroup);
    console.log("Has muscleGroup column:", hasMuscleGroupOld);
  } catch (e) {
    console.log("Error checking exercises table:", e.message);
  }

  // Check the current version by looking at the max version in migrations table
  try {
    const maxVersionResult = db
      .prepare("SELECT MAX(version) as max_version FROM migrations")
      .get();
    const currentVersion = maxVersionResult?.max_version || 0;
    console.log("Current migration version:", currentVersion);
    console.log("Should run migration 6:", currentVersion < 6);
  } catch (e) {
    console.log("Error checking current version:", e.message);
  }

  db.close();
} catch (e) {
  console.error("Error opening database:", e.message);
}
