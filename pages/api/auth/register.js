import { query } from '../../../lib/database';
import { verifyRecaptchaToken } from '../../../lib/recaptcha';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, username, recaptchaToken } = req.body;

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

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate username if not provided
    const finalUsername = username || 
      `${firstName.toLowerCase()}-${lastName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');

    // Create user
    const userResult = await query(
      `INSERT INTO users (
        email, username, password_hash, first_name, last_name, 
        created_at, is_active, email_verified, auth_provider
      ) VALUES ($1, $2, $3, $4, $5, NOW(), true, false, 'local')
      RETURNING id, email, username, first_name, last_name`,
      [email.toLowerCase(), finalUsername, hashedPassword, firstName, lastName]
    );

    if (userResult.rows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    const newUser = userResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.detail.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      if (error.detail.includes('username')) {
        return res.status(409).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}