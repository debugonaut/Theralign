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
