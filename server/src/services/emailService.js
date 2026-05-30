import { getMailTransporter } from '../config/mailer.js';
import logger from '../utils/logger.js';

/**
 * Base helper to send an email using the lazy-loaded transporter.
 * Never throws an error, logging failures to protect calling controllers.
 */
const sendMail = async ({ to, subject, html }) => {
  const transporter = getMailTransporter();
  if (!transporter) {
    logger.warn('Email service unavailable: mailer credentials are not configured');
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Theralign" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    logger.error(`Email dispatch failed to ${to}: ${err.message}`);
    return false; // Returns status instead of throwing to prevent transaction rollbacks
  }
};

/**
 * Send booking confirmation email to patient.
 */
export const sendBookingConfirmation = async ({
  patientEmail,
  patientName,
  doctorName,
  date,
  startTime,
  endTime,
  consultationFee,
  appointmentId,
}) => {
  const subject = `Appointment Confirmed — ${date} at ${startTime}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background: #0EA5E9; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1E293B; margin-top: 0; font-size: 20px;">Appointment Confirmed ✓</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">Hi ${patientName},</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">
          Your appointment has been successfully booked. Here are your booking details:
        </p>
        <div style="background: #F8FAFC; border-left: 4px solid #0EA5E9; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Time:</strong> ${startTime} – ${endTime}</p>
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Consultation Fee:</strong> ₹${consultationFee}</p>
          <p style="margin: 10px 0 0 0; color: #64748B; font-size: 12px;">
            Appointment ID: ${appointmentId}
          </p>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Please arrive 5 minutes early. If you need to cancel or reschedule, you can do so directly from your Theralign dashboard.
        </p>
      </div>
      <div style="padding: 16px; background: #F8FAFC; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          © 2026 Theralign. This is an automated message.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send 24-hour reminder email to patient.
 */
export const sendAppointmentReminder = async ({
  patientEmail,
  patientName,
  doctorName,
  date,
  startTime,
  endTime,
}) => {
  const subject = `Reminder: Your appointment tomorrow at ${startTime}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background: #0EA5E9; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1E293B; margin-top: 0; font-size: 20px;">Appointment Tomorrow 🗓️</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">Hi ${patientName},</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">
          This is a friendly reminder that you have an appointment scheduled for tomorrow:
        </p>
        <div style="background: #F8FAFC; border-left: 4px solid #0EA5E9; padding: 16px; margin: 24px 0; border-radius: 4px;">
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 6px 0; color: #1E293B; font-size: 14px;"><strong>Time:</strong> ${startTime} – ${endTime}</p>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          See you tomorrow! Please contact support or log into your dashboard if you have any questions.
        </p>
      </div>
      <div style="padding: 16px; background: #F8FAFC; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          © 2026 Theralign. This is an automated message.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send cancellation notice email to patient.
 */
export const sendCancellationNotice = async ({
  patientEmail,
  patientName,
  doctorName,
  date,
  startTime,
  cancelledBy,
}) => {
  const subject = `Appointment Cancelled — ${date} at ${startTime}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background: #EF4444; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #EF4444; margin-top: 0; font-size: 20px;">Appointment Cancelled</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">Hi ${patientName},</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.5;">
          Your scheduled appointment with Dr. ${doctorName} on ${date} at ${startTime} has been cancelled${cancelledBy === 'doctor' ? ' by the doctor' : ''}.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          If this was done in error or you wish to schedule a new visit, you can explore other active slots on our discovery page at any time.
        </p>
      </div>
      <div style="padding: 16px; background: #F8FAFC; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          © 2026 Theralign.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};
