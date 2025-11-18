import { query } from '../../../lib/database.js';
import { setAuthCookies } from '../../../lib/auth.js';
import { verifyRecaptchaToken } from '../../../lib/recaptcha.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, rememberMe = false, recaptchaToken } = req.body;

  // Temporarily disable reCAPTCHA verification for development
  // TODO: Re-enable reCAPTCHA verification once keys are properly configured
  /*
  if (recaptchaToken) {
    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, 0.5);
    if (!recaptchaResult.success) {
      return res.status(400).json({ 
        error: 'reCAPTCHA verification failed. Please try again.',
        details: recaptchaResult.error 
      });
    }
  }
  */

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user in database
    const userResult = await query(
      `SELECT id, email, username, first_name, last_name, avatar_url, role, is_active, email_verified, password_hash
       FROM users 
       WHERE email = $1 AND (is_active IS NULL OR is_active = true)`,
      [email.toLowerCase().trim()]
    );

    // Check if user exists
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Verify password with bcrypt
    if (!user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update user's last login
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [user.id]
    );

    // Set authentication cookies
    setAuthCookies(res, user.id, rememberMe);

    // Return user data (without sensitive information)
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      role: user.role,
      email_verified: user.email_verified
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}