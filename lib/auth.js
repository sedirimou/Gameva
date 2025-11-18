/**
 * Authentication Middleware and Utilities
 * Handles user authentication, session validation, and user management
 */

import { query } from './database.js';

/**
 * Format username to be URL-friendly
 * @param {string} name - Original name or username
 * @returns {string} URL-friendly username (lowercase with dashes)
 */
export function formatUsername(name) {
  if (!name) return 'user';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric chars except dashes
    .replace(/-+/g, '-')         // Replace multiple dashes with single dash
    .replace(/^-|-$/g, '');      // Remove leading/trailing dashes
}

/**
 * Middleware to authenticate API requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies.sessionToken;
    const userId = req.cookies.userId;
    
    if (!sessionToken || !userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate session token format
    try {
      const [tokenUserId, timestamp] = Buffer.from(sessionToken, 'base64').toString().split(':');
      if (tokenUserId !== userId) {
        return res.status(401).json({ error: 'Invalid session' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    // Get user from database with all provider fields
    const userResult = await query(
      `SELECT id, email, username, first_name, last_name, avatar_url, role, is_active, email_verified, last_login, created_at,
              steam_id, steam_username, steam_avatar,
              discord_id, discord_username, discord_avatar,
              google_id, google_email, google_avatar,
              auth_provider
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const user = userResult.rows[0];
    
    // Attach user to request object
    req.user = user;
    req.isAuthenticated = true;
    
    if (next) {
      return next();
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication service error' });
  }
}

/**
 * Get authenticated user from request
 * @param {Object} req - Express request object
 * @returns {Object|null} User object or null if not authenticated
 */
export async function getAuthenticatedUser(req) {
  try {
    const sessionToken = req.cookies.sessionToken;
    const userId = req.cookies.userId;
    
    if (!sessionToken || !userId) {
      return null;
    }

    // Validate session token format
    try {
      const [tokenUserId, timestamp] = Buffer.from(sessionToken, 'base64').toString().split(':');
      if (tokenUserId !== userId) {
        return null;
      }
    } catch (error) {
      return null;
    }

    // Get user from database with all provider fields
    const userResult = await query(
      `SELECT id, email, username, first_name, last_name, avatar_url, role, is_active, email_verified, last_login, created_at,
              steam_id, steam_username, steam_avatar,
              discord_id, discord_username, discord_avatar,
              google_id, google_email, google_avatar,
              auth_provider
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return userResult.rows[0];
  } catch (error) {
    console.error('Get authenticated user error:', error);
    return null;
  }
}

/**
 * Create session token for user
 * @param {number} userId - User ID
 * @returns {string} Base64 encoded session token
 */
export function createSessionToken(userId) {
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}

/**
 * Set authentication cookies
 * @param {Object} res - Express response object
 * @param {number} userId - User ID
 * @param {boolean} rememberMe - Whether to set long-term cookies
 */
export function setAuthCookies(res, userId, rememberMe = false) {
  const sessionToken = createSessionToken(userId);
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
  
  res.setHeader('Set-Cookie', [
    `sessionToken=${sessionToken}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict`,
    `userId=${userId}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict`
  ]);
  
  return sessionToken;
}

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
export function clearAuthCookies(res) {
  res.setHeader('Set-Cookie', [
    'sessionToken=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict',
    'userId=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict'
  ]);
}

/**
 * Get authenticated user without sending response
 * @param {Object} req - Express request object
 * @returns {Object|null} User object or null
 */
async function getAuthUser(req) {
  try {
    const sessionToken = req.cookies.sessionToken;
    const userId = req.cookies.userId;
    
    if (!sessionToken || !userId) {
      return null;
    }

    // Validate session token format
    try {
      const [tokenUserId, timestamp] = Buffer.from(sessionToken, 'base64').toString().split(':');
      if (tokenUserId !== userId) {
        return null;
      }
    } catch (error) {
      return null;
    }

    // Get user from database with all provider fields
    const userResult = await query(
      `SELECT id, email, username, first_name, last_name, avatar_url, role, is_active, email_verified, last_login, created_at,
              steam_id, steam_username, steam_avatar,
              discord_id, discord_username, discord_avatar,
              google_id, google_email, google_avatar,
              auth_provider
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return userResult.rows[0];
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

/**
 * Middleware to require admin role for API requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
export async function requireAdmin(req, res, next) {
  try {
    // Get authenticated user without sending response
    const user = await getAuthUser(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // User is authenticated and is admin
    req.user = user;
    req.isAuthenticated = true;
    req.isAdmin = true;
    
    if (next) {
      return next();
    }
    
    return user;
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ error: 'Authorization service error' });
  }
}

/**
 * Validate demo credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {boolean} Whether credentials are valid
 */
export function validateDemoCredentials(email, password) {
  const validCredentials = [
    { email: 'admin@gamava.com', password: 'admin123' },
    { email: 'demo@gamava.com', password: 'demo123' },
    { email: 'user@gamava.com', password: 'user123' }
  ];

  return validCredentials.some(
    cred => cred.email === email && cred.password === password
  );
}