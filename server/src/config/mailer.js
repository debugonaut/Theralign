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
    const host = process.env.EMAIL_HOST;
    if (!host || host.includes('gmail.com')) {
      // Keep existing Gmail setup
      transporter = nodemailer.createTransport({
        service: 'gmail',
        family: 4,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        socketTimeout: 10000,
        greetingTimeout: 10000,
      });
    } else {
      // Production SMTP provider (e.g. Resend, SendGrid)
      const port = Number(process.env.EMAIL_PORT) || 465;
      const secure = process.env.EMAIL_SECURE !== 'false'; // Secure (SSL) by default
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds
        socketTimeout: 10000,
        greetingTimeout: 10000,
      });
    }
  }

  return transporter;
};
