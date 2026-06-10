const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer, with a fallback to logging in the console
 * if SMTP credentials are not configured.
 * 
 * @param {Object} options - Options containing email destination, subject, and body text/html
 */
const sendEmail = async (options) => {
  const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!isConfigured) {
    console.log('\n==================================================');
    console.log('📬 [DEV EMAIL FALLBACK] SMTP Credentials not found in .env.');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('--------------------------------------------------');
    console.log(options.message);
    console.log('==================================================\n');
    return;
  }

  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define mail options
  const mailOptions = {
    from: `PG Exam Portal <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
