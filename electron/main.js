const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const {
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
} = require("./database");

// Import backup manager
const { BackupManager } = require("../utils/backupManager.cjs");

let mainWindow;
let backupManager;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    title: "MetalPlans - مربی پرو",
    backgroundColor: "#ffffff",
    icon: path.join(__dirname, "../build/icon.png"),
  });

  // Load the app - Check if production build exists
  const distPath = path.join(__dirname, "../dist-react/index.html");

  if (fs.existsSync(distPath)) {
    // Production mode
    mainWindow.loadFile(distPath);
  } else {
    // Development mode - load from Vite dev server
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Initialize database when app is ready
app.whenReady().then(() => {
  initDatabase();

  // Initialize backup manager
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "metalplans.db");
  backupManager = new BackupManager(dbPath);
  backupManager.startBackupScheduler();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC Handlers for Database Operations

// Athletes
ipcMain.handle("get-athletes", async () => {
  return getAllAthletes();
});

ipcMain.handle("save-athlete", async (event, athlete) => {
  return saveAthlete(athlete);
});

ipcMain.handle("delete-athlete", async (event, id) => {
  return deleteAthlete(id);
});

// Exercises
ipcMain.handle("get-exercises", async () => {
  return getAllExercises();
});

ipcMain.handle("save-exercise", async (event, exercise) => {
  return saveExercise(exercise);
});

ipcMain.handle("delete-exercise", async (event, id) => {
  return deleteExercise(id);
});

// Plans
ipcMain.handle("get-plans", async () => {
  return getAllPlans();
});

ipcMain.handle("save-plan", async (event, plan) => {
  return savePlan(plan);
});

ipcMain.handle("delete-plan", async (event, id) => {
  return deletePlan(id);
});

// Nutrition Plans
ipcMain.handle("get-nutrition-plans", async () => {
  return getAllNutritionPlans();
});

ipcMain.handle("save-nutrition-plan", async (event, plan) => {
  return saveNutritionPlan(plan);
});

ipcMain.handle("delete-nutrition-plan", async (event, id) => {
  return deleteNutritionPlan(id);
});

// Trainer Profile
ipcMain.handle("get-trainer-profile", async () => {
  return getTrainerProfile();
});

ipcMain.handle("save-trainer-profile", async (event, profile) => {
  return saveTrainerProfile(profile);
});

// Backup Management IPC Handlers
ipcMain.handle("get-backup-config", async () => {
  if (backupManager) {
    return backupManager.getConfig();
  }
  return null;
});

ipcMain.handle("update-backup-config", async (event, config) => {
  if (backupManager) {
    backupManager.updateConfig(config);
    return true;
  }
  return false;
});

ipcMain.handle("create-backup", async () => {
  if (backupManager) {
    return await backupManager.createBackup();
  }
  throw new Error("Backup manager not initialized");
});

ipcMain.handle("restore-backup", async (event, backupPath) => {
  if (backupManager) {
    await backupManager.restoreFromBackup(backupPath);
    return true;
  }
  return false;
});

ipcMain.handle("get-backup-history", async () => {
  if (backupManager) {
    return await backupManager.getBackupHistory();
  }
  return [];
});

ipcMain.handle("verify-backup", async (event, backupPath) => {
  if (backupManager) {
    return await backupManager.verifyBackup(backupPath);
  }
  return false;
});

// Reset Functions
ipcMain.handle("reset-athletes", async () => {
  const { deleteAthlete } = require("./database");
  const athletes = getAllAthletes();
  for (const athlete of athletes) {
    await deleteAthlete(athlete.id);
  }
  return true;
});

ipcMain.handle("reset-plans", async () => {
  const { deletePlan, deleteNutritionPlan } = require("./database");
  const plans = getAllPlans();
  const nutritionPlans = getAllNutritionPlans();
  for (const plan of plans) {
    await deletePlan(plan.id);
  }
  for (const plan of nutritionPlans) {
    await deleteNutritionPlan(plan.id);
  }
  return true;
});

ipcMain.handle("reset-all", async () => {
  const {
    deleteAthlete,
    deleteExercise,
    deletePlan,
    deleteNutritionPlan,
    saveExercise,
  } = require("./database");
  const { DEFAULT_EXERCISES } = require("../constants");

  // Clear all data
  const athletes = getAllAthletes();
  const exercises = getAllExercises();
  const plans = getAllPlans();
  const nutritionPlans = getAllNutritionPlans();

  for (const athlete of athletes) {
    await deleteAthlete(athlete.id);
  }
  for (const exercise of exercises) {
    await deleteExercise(exercise.id);
  }
  for (const plan of plans) {
    await deletePlan(plan.id);
  }
  for (const plan of nutritionPlans) {
    await deleteNutritionPlan(plan.id);
  }

  // Reset trainer profile
  saveTrainerProfile(null);

  // Restore default exercises
  for (const exercise of DEFAULT_EXERCISES) {
    await saveExercise(exercise);
  }

  return true;
});
