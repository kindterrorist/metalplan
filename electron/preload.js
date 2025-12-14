const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
    // Athletes
    getAthletes: () => ipcRenderer.invoke('get-athletes'),
    saveAthlete: (athlete) => ipcRenderer.invoke('save-athlete', athlete),
    deleteAthlete: (id) => ipcRenderer.invoke('delete-athlete', id),

    // Exercises
    getExercises: () => ipcRenderer.invoke('get-exercises'),
    saveExercise: (exercise) => ipcRenderer.invoke('save-exercise', exercise),
    deleteExercise: (id) => ipcRenderer.invoke('delete-exercise', id),

    // Plans
    getPlans: () => ipcRenderer.invoke('get-plans'),
    savePlan: (plan) => ipcRenderer.invoke('save-plan', plan),
    deletePlan: (id) => ipcRenderer.invoke('delete-plan', id),

    // Nutrition Plans
    getNutritionPlans: () => ipcRenderer.invoke('get-nutrition-plans'),
    saveNutritionPlan: (plan) => ipcRenderer.invoke('save-nutrition-plan', plan),
    deleteNutritionPlan: (id) => ipcRenderer.invoke('delete-nutrition-plan', id),

    // Trainer Profile
    getTrainerProfile: () => ipcRenderer.invoke('get-trainer-profile'),
    saveTrainerProfile: (profile) => ipcRenderer.invoke('save-trainer-profile', profile),
});
