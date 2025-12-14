import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Athlete, Exercise, WorkoutPlan, TrainerProfile, NutritionPlan } from '../types';
import { DEFAULT_EXERCISES } from '../constants';

interface MorabiDB extends DBSchema {
  athletes: {
    key: string;
    value: Athlete;
    indexes: { 'by-name': string };
  };
  exercises: {
    key: string;
    value: Exercise;
    indexes: { 'by-muscle': string };
  };
  plans: {
    key: string;
    value: WorkoutPlan;
    indexes: { 'by-athlete': string };
  };
  nutrition_plans: {
    key: string;
    value: NutritionPlan;
    indexes: { 'by-athlete': string };
  };
  settings: {
    key: string;
    value: TrainerProfile;
  };
}

const DB_NAME = 'morabi-pro-db';
const DB_VERSION = 2; // Incremented version for new store

let dbPromise: Promise<IDBPDatabase<MorabiDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MorabiDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
            // Athletes Store
            const athleteStore = db.createObjectStore('athletes', { keyPath: 'id' });
            athleteStore.createIndex('by-name', 'fullName');

            // Exercises Store
            const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
            exerciseStore.createIndex('by-muscle', 'muscleGroup');
            DEFAULT_EXERCISES.forEach(ex => exerciseStore.put(ex));

            // Plans Store
            const planStore = db.createObjectStore('plans', { keyPath: 'id' });
            planStore.createIndex('by-athlete', 'athleteId');

            // Settings Store
            db.createObjectStore('settings');
        }
        
        if (oldVersion < 2) {
            // Nutrition Plans Store
            const nutritionStore = db.createObjectStore('nutrition_plans', { keyPath: 'id' });
            nutritionStore.createIndex('by-athlete', 'athleteId');
        }
      },
    });
  }
  return dbPromise;
};

// --- Athletes ---
export const getAthletes = async () => {
  const db = await initDB();
  return db.getAll('athletes');
};

export const saveAthlete = async (athlete: Athlete) => {
  const db = await initDB();
  return db.put('athletes', athlete);
};

export const deleteAthlete = async (id: string) => {
  const db = await initDB();
  return db.delete('athletes', id);
};

// --- Exercises ---
export const getExercises = async () => {
  const db = await initDB();
  return db.getAll('exercises');
};

export const saveExercise = async (exercise: Exercise) => {
  const db = await initDB();
  return db.put('exercises', exercise);
};

export const deleteExercise = async (id: string) => {
  const db = await initDB();
  return db.delete('exercises', id);
};

// --- Plans ---
export const getPlans = async () => {
  const db = await initDB();
  return db.getAll('plans');
};

export const getPlansByAthlete = async (athleteId: string) => {
  const db = await initDB();
  return db.getAllFromIndex('plans', 'by-athlete', athleteId);
};

export const savePlan = async (plan: WorkoutPlan) => {
  const db = await initDB();
  return db.put('plans', plan);
};

export const deletePlan = async (id: string) => {
  const db = await initDB();
  return db.delete('plans', id);
};

// --- Nutrition Plans ---
export const getNutritionPlans = async () => {
    const db = await initDB();
    return db.getAll('nutrition_plans');
};
  
export const getNutritionPlansByAthlete = async (athleteId: string) => {
    const db = await initDB();
    return db.getAllFromIndex('nutrition_plans', 'by-athlete', athleteId);
};

export const saveNutritionPlan = async (plan: NutritionPlan) => {
    const db = await initDB();
    return db.put('nutrition_plans', plan);
};

export const deleteNutritionPlan = async (id: string) => {
    const db = await initDB();
    return db.delete('nutrition_plans', id);
};

// --- Settings ---
export const getTrainerProfile = async () => {
  const db = await initDB();
  return db.get('settings', 'profile');
};

export const saveTrainerProfile = async (profile: TrainerProfile) => {
  const db = await initDB();
  return db.put('settings', profile, 'profile');
};

// --- Backup/Restore/Reset ---
export const exportDatabase = async () => {
  const db = await initDB();
  const athletes = await db.getAll('athletes');
  const exercises = await db.getAll('exercises');
  const plans = await db.getAll('plans');
  const nutrition = await db.getAll('nutrition_plans');
  const profile = await db.get('settings', 'profile');
  return JSON.stringify({ athletes, exercises, plans, nutrition, profile });
};

export const importDatabase = async (jsonString: string) => {
  try {
    const data = JSON.parse(jsonString);
    const db = await initDB();
    const tx = db.transaction(['athletes', 'exercises', 'plans', 'nutrition_plans', 'settings'], 'readwrite');
    
    if (data.athletes) {
        await Promise.all(data.athletes.map((a: Athlete) => tx.objectStore('athletes').put(a)));
    }
    if (data.exercises) {
        await Promise.all(data.exercises.map((e: Exercise) => tx.objectStore('exercises').put(e)));
    }
    if (data.plans) {
        await Promise.all(data.plans.map((p: WorkoutPlan) => tx.objectStore('plans').put(p)));
    }
    if (data.nutrition) {
        await Promise.all(data.nutrition.map((p: NutritionPlan) => tx.objectStore('nutrition_plans').put(p)));
    }
    if (data.profile) {
        tx.objectStore('settings').put(data.profile, 'profile');
    }
    await tx.done;
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const resetDatabaseStore = async (storeName: 'athletes' | 'plans' | 'nutrition_plans' | 'all') => {
    const db = await initDB();
    const tx = db.transaction(
        storeName === 'all' 
            ? ['athletes', 'plans', 'nutrition_plans', 'settings', 'exercises'] 
            : [storeName], 
        'readwrite'
    );
    
    if (storeName === 'all') {
        await tx.objectStore('athletes').clear();
        await tx.objectStore('plans').clear();
        await tx.objectStore('nutrition_plans').clear();
        await tx.objectStore('settings').clear();
        // We usually keep exercises unless specifically requested, but for factory reset we might clear custom ones? 
        // For safety, let's keep exercises populated with defaults if cleared, or just clear all.
        // Let's implement "Factory Reset" which clears all.
        await tx.objectStore('exercises').clear();
        DEFAULT_EXERCISES.forEach(ex => tx.objectStore('exercises').put(ex));
    } else {
        await tx.objectStore(storeName).clear();
    }
    await tx.done;
};