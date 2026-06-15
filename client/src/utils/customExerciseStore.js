/**
 * customExerciseStore — localStorage CRUD for doctor-created AI exercises.
 *
 * AI-generated exercises need to persist across sessions.
 * The static exerciseLibrary.js is not mutable — custom exercises live here.
 *
 * Storage key: 'theralign_custom_exercises'
 * Each exercise is assigned a unique ID and marked with isCustom: true.
 */

const STORAGE_KEY = 'theralign_custom_exercises';

export const getCustomExercises = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveCustomExercise = (exercise) => {
  try {
    const existing = getCustomExercises();
    const newExercise = {
      ...exercise,
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      category: 'Custom',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newExercise, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newExercise;
  } catch {
    return null;
  }
};

export const deleteCustomExercise = (id) => {
  try {
    const existing = getCustomExercises();
    const updated = existing.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Fail silently — local storage errors should not crash the UI
  }
};
