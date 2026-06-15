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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Theralign" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email successfully dispatched to ${to}. Message ID: ${info.messageId}`);
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
  const subject = `Confirmed: Dr. ${cleanDrName} — ${date} at ${startTime}`;
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const detailLink = appointmentId ? `${clientUrl}/appointments/${appointmentId}` : `${clientUrl}/patient/appointments`;
  const firstName = patientName.split(' ')[0];

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0f0f0f; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #0f0f0f;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f0f0f; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f0f0f; padding-bottom: 8px;">
          Appointment Confirmed
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          YOUR CLINICAL APPOINTMENT HAS BEEN SCHEDULED. HERE ARE YOUR BOOKING DETAILS:
        </p>
        
        <div style="background: #fafafa; border: 2px solid #0f0f0f; padding: 20px; margin: 24px 0;">
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">DOCTOR: <span style="font-weight: 500; color: #555555;">DR. ${cleanDrName.toUpperCase()}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">DATE: <span style="font-weight: 500; color: #555555;">${date}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">TIME: <span style="font-weight: 500; color: #555555;">${startTime} – ${endTime}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">FEE: <span style="font-weight: 500; color: #555555;">₹${consultationFee} / SESSION</span></p>
          <p style="margin: 12px 0 0 0; color: #888888; font-size: 10px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">
            APPOINTMENT ID: ${appointmentId}
          </p>
        </div>
        
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * PLEASE ARRIVE 5 MINUTES PRIOR. TO RESCHEDULE OR CANCEL, MANAGE DIRECTLY FROM YOUR THERALIGN APPOINTMENTS LEDGER.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${detailLink}" style="background-color: #0f0f0f; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #0f0f0f; display: inline-block;">VIEW APPOINTMENT DETAILS →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0f0f0f;">
        <p style="color: #0f0f0f; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
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
  const subject = `Reminder: Dr. ${cleanDrName} Tomorrow at ${startTime}`;
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const detailLink = appointmentId ? `${clientUrl}/appointments/${appointmentId}` : `${clientUrl}/patient/appointments`;
  const firstName = patientName.split(' ')[0];

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0f0f0f; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #0f0f0f;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f0f0f; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f0f0f; padding-bottom: 8px;">
          Appointment Tomorrow
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          THIS IS A FRIENDLY REMINDER THAT YOU HAVE A CLINICAL APPOINTMENT SCHEDULED FOR TOMORROW:
        </p>
        
        <div style="background: #fafafa; border: 2px solid #0f0f0f; padding: 20px; margin: 24px 0;">
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">DOCTOR: <span style="font-weight: 500; color: #555555;">DR. ${cleanDrName.toUpperCase()}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">DATE: <span style="font-weight: 500; color: #555555;">${date}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900; uppercase; tracking-wider;">TIME: <span style="font-weight: 500; color: #555555;">${startTime} – ${endTime}</span></p>
        </div>
        
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * PLEASE LET US KNOW IF YOU NEED TO MAKE ADJUSTMENTS TO THIS BOOKING.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${detailLink}" style="background-color: #0f0f0f; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #0f0f0f; display: inline-block;">VIEW APPOINTMENT DETAILS →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0f0f0f;">
        <p style="color: #0f0f0f; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
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
  const subject = `Cancelled: Dr. ${cleanDrName} on ${date} at ${startTime}`;
  
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const firstName = patientName.split(' ')[0];

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #FF3000; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #FF3000; padding: 24px; text-align: center; border-bottom: 2px solid #FF3000;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #FF3000; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #FF3000; padding-bottom: 8px;">
          Appointment Cancelled
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          YOUR SCHEDULED CONSULTATION WITH DR. ${cleanDrName.toUpperCase()} ON ${date} AT ${startTime} HAS BEEN CANCELLED${cancelledBy === 'doctor' ? ' BY THE DOCTOR' : ''}.
        </p>
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * UNLOCKED TIME SLOTS ARE IMMEDIATELY RELEASED TO THE BOOKINGS DIRECTORY.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${clientUrl}/doctors" style="background-color: #FF3000; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #FF3000; display: inline-block;">EXPLORE ACTIVE SLOTS →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #FF3000;">
        <p style="color: #FF3000; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send refund approved email to patient.
 */
export const sendRefundApprovedEmail = async ({
  patientEmail,
  patientName,
  amount,
  adminNote,
}) => {
  const firstName = patientName.split(' ')[0];
  const subject = `Refund Approved: ₹${amount} is on its way`;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0A7E6E; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0A7E6E; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0A7E6E; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0A7E6E; padding-bottom: 8px;">
          Refund Approved
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          YOUR REFUND REQUEST HAS BEEN REVIEWED AND APPROVED BY OUR TEAM.
        </p>
        <div style="background: #fafafa; border: 2px solid #0A7E6E; padding: 20px; margin: 24px 0;">
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">REFUND AMOUNT: <span style="font-weight: 500; color: #0A7E6E;">₹${amount}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">TIMELINE: <span style="font-weight: 500; color: #555555;">5–7 BUSINESS DAYS</span></p>
          ${adminNote ? `<p style="margin: 12px 0 0 0; color: #777777; font-size: 12px; font-weight: 600;">NOTE: ${adminNote}</p>` : ''}
        </div>
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * THE REFUND WILL BE CREDITED TO YOUR ORIGINAL PAYMENT METHOD. PROCESSING TIME DEPENDS ON YOUR BANK OR CARD ISSUER.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${clientUrl}/patient/payments" style="background-color: #0A7E6E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">VIEW PAYMENT HISTORY →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0A7E6E;">
        <p style="color: #0A7E6E; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">The Theralign Team</p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Automated system dispatch — do not reply. Support: support@theralign.com.</p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send refund rejected email to patient.
 */
export const sendRefundRejectedEmail = async ({
  patientEmail,
  patientName,
  amount,
  adminNote,
}) => {
  const firstName = patientName.split(' ')[0];
  const subject = `Refund Request Update: ₹${amount}`;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #FF3000; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #FF3000; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #FF3000; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #FF3000; padding-bottom: 8px;">
          Refund Request Reviewed
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          YOUR REFUND REQUEST OF ₹${amount} HAS BEEN REVIEWED BY OUR TEAM AND COULD NOT BE APPROVED AT THIS TIME.
        </p>
        ${adminNote ? `
        <div style="background: #fff5f5; border: 2px solid #FF3000; padding: 16px 20px; margin: 24px 0;">
          <p style="margin: 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">REASON FROM OUR TEAM:</p>
          <p style="margin: 8px 0 0 0; color: #555555; font-size: 13px; font-weight: 500;">${adminNote}</p>
        </div>` : ''}
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * IF YOU BELIEVE THIS IS AN ERROR, PLEASE CONTACT OUR SUPPORT TEAM AT SUPPORT@THERALIGN.COM.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${clientUrl}/patient/payments" style="background-color: #FF3000; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">VIEW PAYMENT HISTORY →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #FF3000;">
        <p style="color: #FF3000; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">The Theralign Team</p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Automated system dispatch — do not reply. Support: support@theralign.com.</p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send refund initiation confirmation to patient (patient-cancelled appointment).
 * Tells them their request is queued for admin review.
 */
export const sendRefundInitiatedEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  date,
  startTime,
  amount,
}) => {
  const cleanDrName = doctorName.toLowerCase().startsWith('dr.') ? doctorName.slice(3).trim() : doctorName;
  const firstName = patientName.split(' ')[0];
  const subject = `Refund Request Submitted: ₹${amount} — Dr. ${cleanDrName}`;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #b45309; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #b45309; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #b45309; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #b45309; padding-bottom: 8px;">
          Refund Request Received
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          YOUR APPOINTMENT HAS BEEN CANCELLED AND YOUR REFUND REQUEST HAS BEEN SUBMITTED FOR REVIEW BY OUR TEAM.
        </p>
        <div style="background: #fef3e2; border: 2px solid #b45309; padding: 20px; margin: 24px 0;">
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">DOCTOR: <span style="font-weight: 500; color: #555555;">DR. ${cleanDrName.toUpperCase()}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">DATE: <span style="font-weight: 500; color: #555555;">${date} AT ${startTime}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">REFUND AMOUNT: <span style="font-weight: 500; color: #b45309;">₹${amount}</span></p>
          <p style="margin: 12px 0 0 0; color: #b45309; font-size: 13px; font-weight: 700;">STATUS: PENDING ADMIN REVIEW</p>
        </div>
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * OUR TEAM WILL REVIEW YOUR REQUEST WITHIN 1–2 BUSINESS DAYS. YOU WILL RECEIVE A SEPARATE EMAIL ONCE A DECISION IS MADE. APPROVED REFUNDS ARE CREDITED WITHIN 5–7 BUSINESS DAYS.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${clientUrl}/patient/payments" style="background-color: #b45309; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">VIEW PAYMENT HISTORY →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #b45309;">
        <p style="color: #b45309; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">The Theralign Team</p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Automated system dispatch — do not reply. Support: support@theralign.com.</p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};

/**
 * Send automatic refund notification to patient (doctor-cancelled appointment).
 * Doctor cancellations trigger an immediate Razorpay refund — no admin review needed.
 */
export const sendDoctorCancelledRefundEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  date,
  startTime,
  amount,
}) => {
  const cleanDrName = doctorName.toLowerCase().startsWith('dr.') ? doctorName.slice(3).trim() : doctorName;
  const firstName = patientName.split(' ')[0];
  const subject = `Appointment Cancelled by Dr. ${cleanDrName} — Full Refund Issued`;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0A7E6E; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0A7E6E; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0A7E6E; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0A7E6E; padding-bottom: 8px;">
          Appointment Cancelled — Refund Issued
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          DR. ${cleanDrName.toUpperCase()} HAS CANCELLED YOUR UPCOMING APPOINTMENT. A FULL REFUND HAS BEEN AUTOMATICALLY INITIATED TO YOUR ORIGINAL PAYMENT METHOD — NO ACTION IS NEEDED FROM YOU.
        </p>
        <div style="background: #f0f9f8; border: 2px solid #0A7E6E; padding: 20px; margin: 24px 0;">
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">CANCELLED BY: <span style="font-weight: 500; color: #555555;">DR. ${cleanDrName.toUpperCase()}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">ORIGINAL DATE: <span style="font-weight: 500; color: #555555;">${date} AT ${startTime}</span></p>
          <p style="margin: 6px 0; color: #0f0f0f; font-size: 13px; font-weight: 900;">REFUND AMOUNT: <span style="font-weight: 500; color: #0A7E6E;">₹${amount}</span></p>
          <p style="margin: 12px 0 0 0; color: #0A7E6E; font-size: 13px; font-weight: 700;">STATUS: REFUND AUTOMATICALLY PROCESSED</p>
        </div>
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * THE REFUND WILL APPEAR IN YOUR ACCOUNT WITHIN 5–7 BUSINESS DAYS DEPENDING ON YOUR BANK OR CARD ISSUER. YOU MAY BOOK WITH ANOTHER PHYSIOTHERAPIST AT YOUR CONVENIENCE.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${clientUrl}/doctors" style="background-color: #0A7E6E; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block;">FIND ANOTHER PHYSIOTHERAPIST →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0A7E6E;">
        <p style="color: #0A7E6E; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">The Theralign Team</p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Automated system dispatch — do not reply. Support: support@theralign.com.</p>
      </div>
    </div>
  `;

  return sendMail({ to: patientEmail, subject, html });
};


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
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0f0f0f; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #0f0f0f;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f0f0f; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f0f0f; padding-bottom: 8px;">
          Password Reset Request
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi ${firstName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          WE RECEIVED A REQUEST TO RESET YOUR PASSWORD. USE THE VERIFICATION TOKEN BELOW IN THE PASSWORD RESET FORM:
        </p>
        
        <div style="background: #fafafa; border: 2px dashed #0f0f0f; padding: 20px; margin: 24px 0; text-align: center;">
          <code style="font-family: monospace; font-size: 24px; font-weight: 900; color: #FF3000; letter-spacing: 2px;">${token}</code>
        </div>
        
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * THIS TOKEN WILL EXPIRE IN 15 MINUTES. IF YOU DID NOT INITIATE THIS ACTION, YOU CAN SAFELY IGNORE THIS CORRESPONDENCE.
        </p>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${loginLink}" style="background-color: #0f0f0f; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #0f0f0f; display: inline-block;">GO TO LOGIN PAGE →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0f0f0f;">
        <p style="color: #0f0f0f; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: email, subject, html });
};

export const sendJuniorInviteEmail = async ({
  email,
  seniorName,
  practiceName,
  token,
}) => {
  const subject = 'You have been invited to join a practice on Theralign';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const inviteLink = `${clientUrl}/register/junior?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0f0f0f; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #0f0f0f;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f0f0f; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f0f0f; padding-bottom: 8px;">
          Practice Invitation
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Dear Practitioner,</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          DR. ${seniorName.toUpperCase()} HAS INVITED YOU TO JOIN THEIR PRACTICE ${practiceName ? `"${practiceName.toUpperCase()}"` : ''} ON THE THERALIGN PLATFORM.
        </p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          AS A JUNIOR PRACTITIONER, YOU WILL BE ABLE TO MANAGE PATIENT SESSIONS AND ASSIGN CLINICAL EXERCISES UNDER DR. ${seniorName.toUpperCase()}'S SUPERVISION.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteLink}" style="background-color: #0B4F6C; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #0B4F6C; display: inline-block;">ACCEPT INVITATION & REGISTER →</a>
        </div>
        
        <p style="color: #777777; font-size: 11px; line-height: 1.6; font-weight: 700; text-transform: uppercase; margin-bottom: 28px;">
          * THIS INVITATION LINK WILL EXPIRE IN 7 DAYS. IF YOU DID NOT EXPECT THIS INVITATION, PLEASE DISREGARD THIS CORRESPONDENCE.
        </p>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0f0f0f;">
        <p style="color: #0f0f0f; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: email, subject, html });
};

export const sendJuniorAcceptedEmail = async ({
  seniorEmail,
  juniorName,
  seniorName,
}) => {
  const subject = 'A junior doctor has joined your practice on Theralign';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const dashboardLink = `${clientUrl}/doctor/dashboard`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0f0f0f; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #0f0f0f;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f0f0f; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f0f0f; padding-bottom: 8px;">
          Practice Team Update
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Hi Dr. ${seniorName.toUpperCase()},</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          DR. ${juniorName.toUpperCase()} HAS ACCEPTED YOUR INVITATION AND REGISTERED UNDER YOUR PRACTICE.
        </p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          THEY HAVE BYPASSED ADMIN REVIEW AND CAN NOW START LOGGING SESSIONS AND CREATING REHABILITATION PRESCRIPTIONS FOR ASSIGNED APPOINTMENTS.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${dashboardLink}" style="background-color: #0f0f0f; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #0f0f0f; display: inline-block;">VIEW PRACTICE DASHBOARD →</a>
        </div>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0f0f0f;">
        <p style="color: #0f0f0f; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: seniorEmail, subject, html });
};

export const sendJuniorRemovedEmail = async ({
  juniorEmail,
  seniorName,
}) => {
  const subject = 'Affiliation change notification';

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 2px solid #0f0f0f; background: #ffffff; text-align: left; box-sizing: border-box;">
      <div style="background: #0f0f0f; padding: 24px; text-align: center; border-bottom: 2px solid #0f0f0f;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">Theralign</h1>
      </div>
      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #0f0f0f; margin-top: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f0f0f; padding-bottom: 8px;">
          Affiliation Update
        </h2>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500; margin-top: 20px;">Dear Practitioner,</p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          THIS IS TO INFORM YOU THAT YOU HAVE BEEN REMOVED FROM DR. ${seniorName.toUpperCase()}'S PRACTICE ON THE THERALIGN PLATFORM.
        </p>
        <p style="color: #555555; font-size: 14px; line-height: 1.6; font-weight: 500;">
          YOUR ACCOUNT HAS BEEN CONVERTED TO A SOLO INDEPENDENT PRACTITIONER STATUS.
        </p>
      </div>
      <div style="padding: 20px; background: #fafafa; text-align: center; border-top: 2px solid #0f0f0f;">
        <p style="color: #0f0f0f; font-size: 11px; margin: 0 0 6px 0; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
          The Theralign Team
        </p>
        <p style="color: #888888; font-size: 10px; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          Automated system dispatch — do not reply. Support: support@theralign.com.
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: juniorEmail, subject, html });
};
