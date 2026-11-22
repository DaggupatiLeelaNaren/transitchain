
import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass
  }
});

export const verifyMailerConnection = async () => {
  if (!config.smtp.user || !config.smtp.pass) {
    throw new Error('EMAIL_USER or EMAIL_APP_PASSWORD is missing');
  }

  await transporter.verify();
  console.log('[MAILER] Gmail SMTP connection successful');
};

export const sendOtpEmail = async (toEmail, otp) => {
  if (!config.smtp.user || !config.smtp.pass) {
    throw new Error('Gmail SMTP credentials are not configured');
  }

  const mailOptions = {
    from: `"TransitChain" <${config.smtp.user}>`,
    to: toEmail,
    subject: 'TransitChain - Email Verification OTP',
    text: `
Welcome to TransitChain!

Your email verification OTP is: ${otp}

This OTP expires in 10 minutes.

Do not share this OTP with anyone.
    `,
    html: `
      <div style="font-family:Arial,sans-serif;
        max-width:500px;margin:auto;padding:25px;
        border:1px solid #ddd;border-radius:12px">

        <h2 style="color:#0284c7">TransitChain</h2>

        <p>Welcome to TransitChain!</p>

        <p>Your email verification code is:</p>

        <h1 style="letter-spacing:8px;
          background:#eff6ff;padding:20px;
          text-align:center;color:#0284c7">
          ${otp}
        </h1>

        <p>This OTP expires in <b>10 minutes</b>.</p>

        <p>Do not share this code with anyone.</p>

        <hr />

        <small>TransitChain - Smart Multimodal Journey Platform</small>
      </div>
    `
  };

  const result = await transporter.sendMail(mailOptions);

  console.log(`[MAILER] OTP email sent to ${toEmail}`);

  return {
    sent: true,
    method: 'smtp',
    messageId: result.messageId
  };
};
