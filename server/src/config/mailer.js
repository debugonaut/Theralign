import nodemailer from 'nodemailer';

let transporter = null;

/**
 * Returns a shared, lazy-loaded Nodemailer transporter configured for Gmail.
 * Gracefully returns null if credentials are not configured in the environment.
 */
export const getMailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null; // Graceful degradation: missing keys log warnings instead of crashing
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};
