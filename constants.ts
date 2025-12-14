import { Exercise } from './types';

export const WEEK_DAYS = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

export const MUSCLE_GROUPS = [
  'سینه',
  'زیربغل و پشت',
  'سرشانه',
  'جلوبازو',
  'پشت‌بازو',
  'پـا',
  'شکم و پهلو',
  'هوازی'
];

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: 'پرس سینه دمبل', muscleGroup: 'سینه', type: 'Dumbbell' },
  { id: '2', name: 'پرس بالا سینه هالتر', muscleGroup: 'سینه', type: 'Barbell' },
  { id: '3', name: 'زیربغل سیم‌کش از جلو', muscleGroup: 'زیربغل و پشت', type: 'Cable' },
  { id: '4', name: 'اسکوات', muscleGroup: 'پـا', type: 'Barbell' },
  { id: '5', name: 'جلوبازو هالتر ایستاده', muscleGroup: 'جلوبازو', type: 'Barbell' },
  { id: '6', name: 'پشت‌بازو طناب', muscleGroup: 'پشت‌بازو', type: 'Cable' },
  { id: '7', name: 'نشر جانب دمبل', muscleGroup: 'سرشانه', type: 'Dumbbell' },
  { id: '8', name: 'کرانچ', muscleGroup: 'شکم و پهلو', type: 'Bodyweight' },
  { id: '9', name: 'دویدن روی تردمیل', muscleGroup: 'هوازی', type: 'Machine' },
];
