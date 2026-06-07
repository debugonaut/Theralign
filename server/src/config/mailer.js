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
    } else if (host && host.includes('resend.com')) {
      // Resend SMTP ports (25, 465, 587) are blocked by default on environments like Render Free Tier.
      // We bypass this by routing mail requests directly through Resend's REST API over HTTPS (port 443).
      transporter = {
        sendMail: async ({ from, to, subject, html, text }) => {
          const apiKey = process.env.EMAIL_PASS;
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: from || process.env.EMAIL_FROM || `"Theralign" <${process.env.EMAIL_USER}>`,
              to: typeof to === 'string' ? to.split(',').map(e => e.trim()) : to,
              subject,
              html,
              text,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Resend API returned status ${response.status}`);
          }

          const data = await response.json();
          return {
            messageId: data.id,
            response: '250 OK',
          };
        },
      };
    } else {
      // Production SMTP provider (e.g. SendGrid)
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
