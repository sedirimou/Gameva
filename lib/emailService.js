/**
 * Email Service using Nodemailer with Gmail SMTP
 * Handles email sending functionality for the application
 */

const nodemailer = require('nodemailer');

/**
 * Create email transporter with dynamic configuration
 * @param {Object} customConfig - Optional custom email configuration
 * @returns {Object} Nodemailer transporter
 */
function createTransporter(customConfig = null) {
  if (customConfig) {
    // Use custom configuration
    const config = {
      host: customConfig.host,
      port: parseInt(customConfig.port),
      secure: parseInt(customConfig.port) === 465, // true for 465, false for other ports
      auth: {
        user: customConfig.username,
        pass: customConfig.password
      }
    };

    // Add additional options for specific providers
    if (customConfig.host.includes('gmail')) {
      config.service = 'gmail';
    }

    return nodemailer.createTransport(config);
  }

  // Fallback to environment variables (existing behavior)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/**
 * Send a test email to verify the configuration
 * @param {string} to - Recipient email address
 * @param {Object} customConfig - Optional custom email configuration
 * @returns {Promise<Object>} Email send result
 */
async function sendTestEmail(to, customConfig = null) {
  const transporter = createTransporter(customConfig);
  
  const fromEmail = customConfig ? customConfig.senderEmail : process.env.EMAIL_USER;
  const fromName = customConfig ? customConfig.senderName : 'Gameva';
  
  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: to,
    subject: 'Gameva Email Service Test',
    text: 'This is a test email from Gameva to verify that the email service is working correctly.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #153e8f;">Gameva Email Service Test</h2>
        <p>This is a test email to verify that the email service is working correctly.</p>
        <p>If you received this email, the Gmail SMTP configuration is successful!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          Sent from Gameva Gaming Platform<br>
          <a href="https://gameva.vercel.app" style="color: #153e8f;">https://gameva.vercel.app</a>
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Test email sent successfully'
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
}

/**
 * Send welcome email to new users
 * @param {string} to - Recipient email address
 * @param {string} firstName - User's first name
 * @returns {Promise<Object>} Email send result
 */
async function sendWelcomeEmail(to, firstName) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Welcome to Gameva - Your Gaming Journey Starts Here!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #153e8f 0%, #29adb2 100%); padding: 1px;">
        <div style="background: white; margin: 1px; padding: 40px;">
          <h1 style="color: #153e8f; text-align: center; margin-bottom: 30px;">Welcome to Gameva!</h1>
          
          <p style="font-size: 18px; color: #333;">Hi ${firstName || 'Gamer'},</p>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to Gameva, your ultimate destination for digital gaming products! 
            We're excited to have you join our community of passionate gamers.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #153e8f; margin-top: 0;">What you can do with Gameva:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Browse thousands of digital game keys</li>
              <li>Discover new releases and special deals</li>
              <li>Manage your wishlist and cart</li>
              <li>Secure payment processing with Stripe</li>
              <li>Instant digital delivery</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://gameva.vercel.app" 
               style="background: linear-gradient(131deg, #99b476 0%, #29adb2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Start Gaming Now
            </a>
          </div>
          
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; text-align: center;">
            Thanks for choosing Gameva!<br>
            The Gameva Team<br>
            <a href="https://gameva.vercel.app" style="color: #153e8f;">https://gameva.vercel.app</a>
          </p>
        </div>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Welcome email sent successfully'
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} firstName - User's first name
 * @returns {Promise<Object>} Email send result
 */
async function sendPasswordResetEmail(to, resetToken, firstName) {
  const transporter = createTransporter();
  const resetLink = `https://gameva.vercel.app/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Gameva - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #153e8f;">Password Reset Request</h2>
        
        <p>Hi ${firstName || 'there'},</p>
        
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset your password for your Gameva account. 
          Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #153e8f; 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour for security reasons.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          If you didn't request this password reset, please ignore this email. 
          Your password will remain unchanged.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px;">
          For security, this link can only be used once and will expire in 1 hour.<br>
          If you're having trouble clicking the button, copy and paste this URL into your browser:<br>
          <a href="${resetLink}" style="color: #153e8f; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      message: 'Password reset email sent successfully'
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Verify email service configuration
 * @returns {Promise<boolean>} True if configuration is valid
 */
async function verifyEmailService() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    throw error;
  }
}

module.exports = {
  sendTestEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  verifyEmailService,
  createTransporter
};