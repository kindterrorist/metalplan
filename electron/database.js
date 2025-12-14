const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// Database file location
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'metalplans.db');

// Ensure directory exists
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database schema
function initDatabase() {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Create tables
    db.exec(`
    CREATE TABLE IF NOT EXISTS athletes (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT,
      age INTEGER,
      height INTEGER,
      gender TEXT,
      joinDate TEXT,
      measurements TEXT,
      currentGoal TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      muscleGroup TEXT,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      athleteId TEXT,
      days TEXT,
      created_at INTEGER,
      FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      athleteId TEXT,
      days TEXT,
      created_at INTEGER,
      FOREIGN KEY (athleteId) REFERENCES athletes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_plans_athlete ON plans(athleteId);
    CREATE INDEX IF NOT EXISTS idx_nutrition_athlete ON nutrition_plans(athleteId);
  `);

    console.log('Database initialized at:', dbPath);
}

// Athletes CRUD
function getAllAthletes() {
    const stmt = db.prepare('SELECT * FROM athletes');
    const athletes = stmt.all();
    return athletes.map(a => ({
        ...a,
        measurements: a.measurements ? JSON.parse(a.measurements) : []
    }));
}

function saveAthlete(athlete) {
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

    return athlete;
}

function deleteAthlete(id) {
    const stmt = db.prepare('DELETE FROM athletes WHERE id = ?');
    stmt.run(id);
}

// Exercises CRUD
function getAllExercises() {
    const stmt = db.prepare('SELECT * FROM exercises');
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
    const stmt = db.prepare('DELETE FROM exercises WHERE id = ?');
    stmt.run(id);
}

// Plans CRUD
function getAllPlans() {
    const stmt = db.prepare('SELECT * FROM plans');
    const plans = stmt.all();
    return plans.map(p => ({
        ...p,
        days: p.days ? JSON.parse(p.days) : []
    }));
}

function savePlan(plan) {
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

    return plan;
}

function deletePlan(id) {
    const stmt = db.prepare('DELETE FROM plans WHERE id = ?');
    stmt.run(id);
}

// Nutrition Plans CRUD
function getAllNutritionPlans() {
    const stmt = db.prepare('SELECT * FROM nutrition_plans');
    const plans = stmt.all();
    return plans.map(p => ({
        ...p,
        days: p.days ? JSON.parse(p.days) : []
    }));
}

function saveNutritionPlan(plan) {
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

    return plan;
}

function deleteNutritionPlan(id) {
    const stmt = db.prepare('DELETE FROM nutrition_plans WHERE id = ?');
    stmt.run(id);
}

// Trainer Profile
function getTrainerProfile() {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get('trainer_profile');
    return result ? JSON.parse(result.value) : null;
}

function saveTrainerProfile(profile) {
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO settings (key, value)
    VALUES (?, ?)
  `);

    stmt.run('trainer_profile', JSON.stringify(profile));
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
    saveTrainerProfile
};
