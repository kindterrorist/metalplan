export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const COLOR_PALETTES: Record<string, { label: string, colors: Record<string, string> }> = {
    blue: {
        label: 'آبی (پیش‌فرض)',
        colors: {
            '50': '239 246 255', '100': '219 234 254',
            '500': '59 130 246', '600': '37 99 235', '700': '29 78 216', '800': '30 64 175', '900': '30 58 138'
        }
    },
    emerald: {
        label: 'سبز زمردی',
        colors: {
            '50': '236 253 245', '100': '209 250 229',
            '500': '16 185 129', '600': '5 150 105', '700': '4 120 87', '800': '6 95 70', '900': '6 78 59'
        }
    },
    purple: {
        label: 'بنفش',
        colors: {
            '50': '245 243 255', '100': '237 233 254',
            '500': '139 92 246', '600': '124 58 237', '700': '109 40 217', '800': '91 33 182', '900': '76 29 149'
        }
    },
    rose: {
        label: 'سرخ',
        colors: {
            '50': '255 241 242', '100': '255 228 229',
            '500': '244 63 94', '600': '225 29 72', '700': '190 18 60', '800': '159 18 57', '900': '136 19 55'
        }
    },
    amber: {
        label: 'طلایی',
        colors: {
            '50': '255 251 235', '100': '254 243 199',
            '500': '245 158 11', '600': '217 119 6', '700': '180 83 9', '800': '146 64 14', '900': '120 53 15'
        }
    },
};

// --- Analytics & Calculation Helpers ---

import { Athlete, Measurement, WorkoutLogEntry, Goal, PersonalRecord, WorkoutPlan } from '../types';

export interface BodyComposition {
    leanMass: number;
    fatMass: number;
    totalWeight: number;
}

export const calculateBodyComposition = (weight: number, bodyFat?: number): BodyComposition => {
    if (!bodyFat || bodyFat <= 0) {
        return { leanMass: weight, fatMass: 0, totalWeight: weight };
    }
    const fatMass = (weight * bodyFat) / 100;
    const leanMass = weight - fatMass;
    return { leanMass, fatMass, totalWeight: weight };
};

export interface ProgressChange {
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
}

export const calculateProgress = (measurements: Measurement[], metric: keyof Measurement): ProgressChange | null => {
    if (measurements.length < 2) return null;

    const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const first = sorted[0];

    const current = latest[metric] as number;
    const previous = first[metric] as number;

    if (current === undefined || previous === undefined) return null;

    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return {
        current,
        previous,
        change,
        changePercent,
        isPositive: change < 0 // For weight/fat, reduction is positive
    };
};

export const calculateWorkoutAdherence = (
    workoutLog: WorkoutLogEntry[] = [],
    dateRange: { start: Date; end: Date }
): number => {
    const logsInRange = workoutLog.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= dateRange.start && logDate <= dateRange.end;
    });

    if (logsInRange.length === 0) return 0;

    const completed = logsInRange.filter(log => log.completed).length;
    return Math.round((completed / logsInRange.length) * 100);
};

export const getPersonalRecords = (athlete: Athlete, exerciseName?: string): PersonalRecord[] => {
    if (!athlete.personalRecords) return [];

    let records = athlete.personalRecords;

    if (exerciseName) {
        records = records.filter(pr => pr.exerciseName.toLowerCase() === exerciseName.toLowerCase());
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const calculateGoalProgress = (goal: Goal): number => {
    if (goal.achieved) return 100;

    if (goal.target === 0) return 100;

    const progress = (goal.current / goal.target) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
};

export interface WeeklyReport {
    period: string;
    weightChange: number;
    bodyFatChange: number;
    workoutsCompleted: number;
    adherenceRate: number;
    newPRs: number;
}

export const generateWeeklyReport = (
    athlete: Athlete,
    dateRange: { start: Date; end: Date }
): WeeklyReport => {
    const measurementsInRange = athlete.measurements.filter(m => {
        const date = new Date(m.date);
        return date >= dateRange.start && date <= dateRange.end;
    });

    const sorted = measurementsInRange.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const weightChange = sorted.length >= 2
        ? sorted[sorted.length - 1].weight - sorted[0].weight
        : 0;

    const bodyFatChange = sorted.length >= 2 && sorted[0].bodyFat && sorted[sorted.length - 1].bodyFat
        ? sorted[sorted.length - 1].bodyFat! - sorted[0].bodyFat!
        : 0;

    const workoutsCompleted = (athlete.workoutLog || []).filter(log => {
        const date = new Date(log.date);
        return date >= dateRange.start && date <= dateRange.end && log.completed;
    }).length;

    const adherenceRate = calculateWorkoutAdherence(athlete.workoutLog, dateRange);

    const newPRs = (athlete.personalRecords || []).filter(pr => {
        const date = new Date(pr.date);
        return date >= dateRange.start && date <= dateRange.end;
    }).length;

    return {
        period: `${dateRange.start.toLocaleDateString('fa-IR')} - ${dateRange.end.toLocaleDateString('fa-IR')}`,
        weightChange,
        bodyFatChange,
        workoutsCompleted,
        adherenceRate,
        newPRs
    };
};

export const estimateGoalDate = (current: number, target: number, weeklyTrend: number): Date | null => {
    if (weeklyTrend === 0) return null;

    const difference = Math.abs(target - current);
    const weeksNeeded = Math.ceil(difference / Math.abs(weeklyTrend));

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (weeksNeeded * 7));

    return estimatedDate;
};

