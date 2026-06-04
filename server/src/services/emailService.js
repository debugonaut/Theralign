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
  const cleanDrName = doctorName.toLowerCase().startsWith('dr.') ? doctorName.slice(3).trim() : doctorName;
  const subject = `Your Appointment with Dr. ${cleanDrName} is Confirmed — ${date} at ${startTime}`;
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const detailLink = appointmentId ? `${clientUrl}/appointments/${appointmentId}` : `${clientUrl}/patient/appointments`;
  const firstName = patientName.split(' ')[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #DDE3EA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(11,79,108,0.06);">
      <div style="background: #0B4F6C; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; text-align: left;">
        <h2 style="color: #1C2B3A; margin-top: 0; font-size: 20px; font-weight: 700;">Appointment Confirmed</h2>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">
          Your appointment has been successfully booked. Here are your booking details:
        </p>
        <div style="background: #F7F9FB; border-left: 4px solid #0A7E6E; padding: 20px; margin: 24px 0; border-radius: 6px; border-right: 1px solid #DDE3EA; border-top: 1px solid #DDE3EA; border-bottom: 1px solid #DDE3EA;">
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Doctor: <span style="font-weight: normal; color: #3D5166;">Dr. ${cleanDrName}</span></p>
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Date: <span style="font-weight: normal; color: #3D5166;">${date}</span></p>
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Time: <span style="font-weight: normal; color: #3D5166;">${startTime} – ${endTime}</span></p>
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Consultation Fee: <span style="font-weight: normal; color: #3D5166;">₹${consultationFee} / session</span></p>
          <p style="margin: 12px 0 0 0; color: #A8B8C8; font-size: 11px; font-weight: bold; uppercase tracking: 0.05em;">
            Appointment ID: ${appointmentId}
          </p>
        </div>
        <p style="color: #6B7C93; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          Arrive 5 minutes early. If you need to cancel or reschedule, do so directly from your Theralign dashboard.
        </p>
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${detailLink}" style="background-color: #0A7E6E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">VIEW APPOINTMENT DETAILS</a>
        </div>
      </div>
      <div style="padding: 20px; background: #F7F9FB; text-align: center; border-top: 2px solid #DDE3EA;">
        <p style="color: #6B7C93; font-size: 12px; margin: 0 0 8px 0; font-weight: bold;">
          The Theralign Team
        </p>
        <p style="color: #A8B8C8; font-size: 11px; margin: 0;">
          This is an automated message — please do not reply to this email. For support, contact support@theralign.com.
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
  appointmentId,
}) => {
  const cleanDrName = doctorName.toLowerCase().startsWith('dr.') ? doctorName.slice(3).trim() : doctorName;
  const subject = `Reminder: Your Appointment with Dr. ${cleanDrName} Tomorrow at ${startTime}`;
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const detailLink = appointmentId ? `${clientUrl}/appointments/${appointmentId}` : `${clientUrl}/patient/appointments`;
  const firstName = patientName.split(' ')[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #DDE3EA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(11,79,108,0.06);">
      <div style="background: #0B4F6C; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; text-align: left;">
        <h2 style="color: #1C2B3A; margin-top: 0; font-size: 20px; font-weight: 700;">Appointment Tomorrow</h2>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">
          This is a friendly reminder that you have an appointment scheduled for tomorrow:
        </p>
        <div style="background: #F7F9FB; border-left: 4px solid #0A7E6E; padding: 20px; margin: 24px 0; border-radius: 6px; border-right: 1px solid #DDE3EA; border-top: 1px solid #DDE3EA; border-bottom: 1px solid #DDE3EA;">
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Doctor: <span style="font-weight: normal; color: #3D5166;">Dr. ${cleanDrName}</span></p>
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Date: <span style="font-weight: normal; color: #3D5166;">${date}</span></p>
          <p style="margin: 6px 0; color: #1C2B3A; font-size: 14px; font-weight: bold;">Time: <span style="font-weight: normal; color: #3D5166;">${startTime} – ${endTime}</span></p>
        </div>
        <p style="color: #6B7C93; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          See you tomorrow. Contact support at support@theralign.com if you have any questions.
        </p>
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${detailLink}" style="background-color: #0A7E6E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">VIEW APPOINTMENT DETAILS</a>
        </div>
      </div>
      <div style="padding: 20px; background: #F7F9FB; text-align: center; border-top: 2px solid #DDE3EA;">
        <p style="color: #6B7C93; font-size: 12px; margin: 0 0 8px 0; font-weight: bold;">
          The Theralign Team
        </p>
        <p style="color: #A8B8C8; font-size: 11px; margin: 0;">
          This is an automated message — please do not reply to this email. For support, contact support@theralign.com.
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
  appointmentId,
}) => {
  const cleanDrName = doctorName.toLowerCase().startsWith('dr.') ? doctorName.slice(3).trim() : doctorName;
  const subject = `Appointment Cancelled — Dr. ${cleanDrName} on ${date} at ${startTime}`;
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const firstName = patientName.split(' ')[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #DDE3EA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(11,79,108,0.06);">
      <div style="background: #C0392B; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; text-align: left;">
        <h2 style="color: #C0392B; margin-top: 0; font-size: 20px; font-weight: 700;">Appointment Cancelled</h2>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">
          Your scheduled appointment with Dr. ${cleanDrName} on ${date} at ${startTime} has been cancelled${cancelledBy === 'doctor' ? ' by the doctor' : ''}.
        </p>
        <p style="color: #6B7C93; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          If you wish to schedule a new visit, you can explore other active slots on our discovery page at any time.
        </p>
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${clientUrl}/doctors" style="background-color: #0A7E6E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">EXPLORE ACTIVE SLOTS</a>
        </div>
      </div>
      <div style="padding: 20px; background: #F7F9FB; text-align: center; border-top: 2px solid #DDE3EA;">
        <p style="color: #6B7C93; font-size: 12px; margin: 0 0 8px 0; font-weight: bold;">
          The Theralign Team
        </p>
        <p style="color: #A8B8C8; font-size: 11px; margin: 0;">
          This is an automated message — please do not reply to this email. For support, contact support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send password reset email with the verification token.
 */
export const sendPasswordResetEmail = async ({
  email,
  name,
  token,
}) => {
  const subject = 'Reset Your Theralign Password';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const loginLink = `${clientUrl}/login`;
  const firstName = name.split(' ')[0];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #DDE3EA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(11,79,108,0.06);">
      <div style="background: #0B4F6C; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; text-align: left;">
        <h2 style="color: #1C2B3A; margin-top: 0; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="color: #6B7C93; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. Use the verification token below in the password reset form:
        </p>
        <div style="background: #F7F9FB; border: 2px dashed #0A7E6E; padding: 16px; margin: 24px 0; border-radius: 6px; text-align: center;">
          <code style="font-family: monospace; font-size: 18px; font-weight: bold; color: #0A7E6E; letter-spacing: 1px;">${token}</code>
        </div>
        <p style="color: #6B7C93; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          This token will expire in 15 minutes. If you did not request a password reset, please ignore this email.
        </p>
        <div style="text-align: center; margin: 32px 0 16px 0;">
          <a href="${loginLink}" style="background-color: #0A7E6E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block;">GO TO LOGIN PAGE</a>
        </div>
      </div>
      <div style="padding: 20px; background: #F7F9FB; text-align: center; border-top: 2px solid #DDE3EA;">
        <p style="color: #6B7C93; font-size: 12px; margin: 0 0 8px 0; font-weight: bold;">
          The Theralign Team
        </p>
        <p style="color: #A8B8C8; font-size: 11px; margin: 0;">
          This is an automated message — please do not reply to this email. For support, contact support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: email, subject, html });
};
