import { query } from '../../../lib/database';
import { verifyRecaptchaToken } from '../../../lib/recaptcha';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, recaptchaToken } = req.body;

    // Verify reCAPTCHA token
    if (recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, 0.5);
      if (!recaptchaResult.success) {
        return res.status(400).json({ 
          error: 'reCAPTCHA verification failed. Please try again.',
          details: recaptchaResult.error 
        });
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, first_name, last_name, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If this email exists in our system, you will receive password reset instructions.'
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameva.vercel.app'}/reset-password?token=${resetToken}`;

    // Get the password reset template from database
    const templateResult = await query(
      'SELECT * FROM email_templates WHERE template_key = $1 AND is_enabled = true',
      ['password_reset']
    );

    if (templateResult.rows.length === 0) {
      console.error('Password reset template not found');
      return res.status(500).json({
        success: false,
        message: 'Email system configuration error. Please contact support.'
      });
    }

    const template = templateResult.rows[0];

    // Replace dynamic tags with user data
    let emailContent = template.content;
    let emailSubject = template.subject;

    const testData = {
      '[USER_NAME]': `${user.first_name} ${user.last_name}`.trim() || 'User',
      '[USER_EMAIL]': user.email,
      '[RESET_LINK]': resetLink
    };

    // Replace all tags in content and subject
    Object.keys(testData).forEach(tag => {
      const value = testData[tag];
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      emailContent = emailContent.replace(new RegExp(escapedTag, 'g'), value);
      emailSubject = emailSubject.replace(new RegExp(escapedTag, 'g'), value);
    });

    // Get email configuration from environment
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
      }
    };

    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Email options
    const mailOptions = {
      from: emailConfig.auth.user,
      to: user.email,
      subject: emailSubject,
      html: emailContent,
      text: emailContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    try {
      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);

      res.status(200).json({
        success: true,
        message: 'If this email exists in our system, you will receive password reset instructions.'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
}