import axiosInstance from './axiosInstance';

/**
 * Doctor creates a new availability slot.
 * @param {object} data - { date: "YYYY-MM-DD", startTime: "HH:mm", endTime: "HH:mm" }
 */
export const createSlot = async (data) => {
  const response = await axiosInstance.post('/availability/slots', data);
  return response.data;
};

/**
 * Doctor creates weekly recurring availability slots.
 * @param {object} data - { date: "YYYY-MM-DD", startTime: "HH:mm", endTime: "HH:mm", repeatWeeks: 4 }
 */
export const createRecurringSlots = async (data) => {
  const response = await axiosInstance.post('/availability/slots/recurring', data);
  return response.data;
};

/**
 * Doctor retrieves their own scheduled availability slots.
 */
export const getMySlots = async () => {
  const response = await axiosInstance.get('/availability/slots/mine');
  return response.data;
};

/**
 * Doctor deletes an unbooked availability slot.
 * @param {string} slotId - Slot ID to delete
 */
export const deleteSlot = async (slotId) => {
  const response = await axiosInstance.delete(`/availability/slots/${slotId}`);
  return response.data;
};

// ─── Weekly Schedule API ──────────────────────────────────────────────────────

/**
 * Doctor retrieves their WeeklySchedule configuration.
 */
export const getWeeklyScheduleAPI = async () => {
  const response = await axiosInstance.get('/availability/schedule');
  return response.data;
};

/**
 * Doctor saves (upserts) their WeeklySchedule configuration.
 * @param {object} data - { schedule, slotDurationMinutes, breakEnabled, breakStartTime, breakEndTime }
 */
export const saveWeeklyScheduleAPI = async (data) => {
  const response = await axiosInstance.post('/availability/schedule', data);
  return response.data;
};

/**
 * Doctor blocks a date (marks it unavailable).
 * @param {string} date - YYYY-MM-DD
 */
export const blockDateAPI = async (date) => {
  const response = await axiosInstance.post('/availability/block-date', { date });
  return response.data;
};

/**
 * Doctor unblocks a previously blocked date.
 * @param {string} date - YYYY-MM-DD
 */
export const unblockDateAPI = async (date) => {
  const response = await axiosInstance.delete('/availability/block-date', { data: { date } });
  return response.data;
};

/**
 * Public — get available slots for a doctor on a specific date.
 * Uses WeeklySchedule if configured, falls back to legacy AvailabilitySlot model.
 * @param {string} doctorId - DoctorProfile _id
 * @param {string} date - YYYY-MM-DD
 */
export const getAvailableSlotsByDateAPI = async (doctorId, date) => {
  const response = await axiosInstance.get(`/availability/${doctorId}/slots?date=${date}`);
  return response.data;
};

