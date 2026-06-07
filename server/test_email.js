import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

const host = process.env.EMAIL_HOST;
let transporter;

if (!host || host.includes('gmail.com')) {
  console.log('Testing connection using Gmail service configuration...');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure = process.env.EMAIL_SECURE !== 'false';
  console.log(`Testing connection using custom SMTP configuration (${host}:${port}, secure=${secure})...`);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

try {
  console.log('Attempting to send test email...');
  const recipient = process.env.EMAIL_USER.includes('@') 
    ? process.env.EMAIL_USER 
    : (process.env.EMAIL_FROM.match(/<(.+)>/)?.[1] || 'hello@aadeshkhande.com');

  console.log('Sending test email to:', recipient);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Theralign" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: 'Theralign SMTP Test',
    text: 'If you are reading this, nodemailer is working perfectly!',
  });
  console.log('Email sent successfully!');
  console.log('Message ID:', info.messageId);
  console.log('Response:', info.response);
} catch (error) {
  console.error('Error occurred while sending email:');
  console.error(error);
}
