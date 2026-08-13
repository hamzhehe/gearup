const transporter = require('../config/mail');

const USER_FACING_EMAIL_ERROR = 'Unable to send verification email. Please try again later.';

const sendEmail = async (options) => {
  const from = process.env.EMAIL_FROM || 'GearUp <noreply@gearupsports.me>';

  console.log('[EMAIL] Attempting to send email to:', options.email, 'using Nodemailer (SMTP)');

  const mailOptions = {
    from: from,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent Successfully`, {
      to: options.email,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error(`❌ Email Sending Failed:`, error.message);
    console.error('[EMAIL] Stack:', error.stack);
    throw new Error(USER_FACING_EMAIL_ERROR);
  }
};

module.exports = sendEmail;
