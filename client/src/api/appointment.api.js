import axiosInstance from './axiosInstance';

/**
 * Public: Retrieve future available slots for a doctor, grouped by date.
 * @param {string} doctorId - Doctor Profile ID
 */
export const getDoctorAvailability = async (doctorId) => {
  const response = await axiosInstance.get(`/availability/${doctorId}/available`);
  return response.data;
};

/**
 * Patient: Schedules/books an appointment by securing a slot.
 * @param {object} data - { slotId, patientNotes }
 */
export const bookAppointment = async (data) => {
  const response = await axiosInstance.post('/appointments/book', data);
  return response.data;
};

/**
 * Patient: Retrieves booking transaction histories.
 */
export const getMyAppointments = async () => {
  const response = await axiosInstance.get('/appointments/mine');
  return response.data;
};

/**
 * Doctor: Retrieves patient schedules.
 */
export const getDoctorAppointments = async () => {
  const response = await axiosInstance.get('/appointments/doctor/mine');
  return response.data;
};

/**
 * Patient/Doctor/Admin: Cancels a confirmed booking.
 * @param {string} id - Appointment ID
 * @param {string} reason - Cancellation explanation
 */
export const cancelAppointment = async (id, reason = '') => {
  const response = await axiosInstance.patch(`/appointments/${id}/cancel`, { reason });
  return response.data;
};

/**
 * Doctor: Completes a patient appointment.
 * @param {string} id - Appointment ID
 */
export const completeAppointment = async (id) => {
  const response = await axiosInstance.patch(`/appointments/${id}/complete`);
  return response.data;
};
