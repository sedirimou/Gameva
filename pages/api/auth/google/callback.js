import { query } from '../../../../lib/database.js';
import { setAuthCookies, formatUsername } from '../../../../lib/auth.js';
import { config, SITE_URL } from '../../../../lib/config.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '861035657088-8cqqbpu315bd685ts7r7p2arh1glgg65.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${SITE_URL}/api/auth/google/callback`;

// Validate required environment variables
if (!GOOGLE_CLIENT_SECRET) {
  console.error('GOOGLE_CLIENT_SECRET environment variable is required for Google OAuth');
}

async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Google token exchange error:', error);
    throw error;
  }
}

async function getGoogleUserInfo(accessToken) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google user info failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Google user info error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if required environment variables are set
    if (!GOOGLE_CLIENT_SECRET) {
      console.error('GOOGLE_CLIENT_SECRET environment variable is not configured');
      return res.redirect(`${SITE_URL}/auth?error=google_config_missing`);
    }

    const { code, error } = req.query;

    if (error) {
      console.error('Google OAuth error:', error);
      return res.redirect(`${SITE_URL}/auth?error=google_oauth_denied`);
    }

    if (!code) {
      console.error('No authorization code received from Google');
      return res.redirect(`${SITE_URL}/auth?error=google_no_code`);
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    
    if (!tokenData.access_token) {
      console.error('No access token received from Google');
      return res.redirect(`${SITE_URL}/auth?error=google_token_failed`);
    }

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokenData.access_token);
    
    if (!googleUser.id) {
      console.error('Could not retrieve Google user info');
      return res.redirect(`${SITE_URL}/auth?error=google_user_info_failed`);
    }

    // Check if user already exists with this Google ID
    let userResult = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleUser.id]
    );

    let user;
    if (userResult.rows.length > 0) {
      // Update existing user with comprehensive details
      user = userResult.rows[0];
      
      // Extract names for existing users if not already set
      const firstName = googleUser.given_name || googleUser.name?.split(' ')[0] || googleUser.email?.split('@')[0] || 'User';
      const lastName = googleUser.family_name || (googleUser.name?.split(' ').length > 1 ? googleUser.name.split(' ').slice(1).join(' ') : '');
      const username = googleUser.name || googleUser.email?.split('@')[0] || `google_user_${googleUser.id}`;
      const avatarUrl = googleUser.picture || null;
      
      await query(`
        UPDATE users 
        SET google_email = $1, google_avatar = $2,
            first_name = COALESCE(NULLIF(first_name, ''), $3),
            last_name = COALESCE(NULLIF(last_name, ''), $4),
            username = COALESCE(NULLIF(username, ''), $5),
            avatar_url = COALESCE(NULLIF(avatar_url, ''), $6),
            email = COALESCE(NULLIF(email, ''), $7),
            last_login = CURRENT_TIMESTAMP 
        WHERE id = $8
      `, [
        googleUser.email,
        avatarUrl,
        firstName,
        lastName,
        formatUsername(username),
        avatarUrl,
        googleUser.email,
        user.id
      ]);
      
      // Update user object with latest data
      user.google_email = googleUser.email;
      user.google_avatar = avatarUrl;
      user.first_name = user.first_name || firstName;
      user.last_name = user.last_name || lastName;
      user.username = user.username || username;
      user.avatar_url = user.avatar_url || avatarUrl;
      user.email = user.email || googleUser.email;
    } else {
      // Check if user exists with same email
      if (googleUser.email) {
        userResult = await query(
          'SELECT * FROM users WHERE email = $1',
          [googleUser.email]
        );
        
        if (userResult.rows.length > 0) {
          // Link Google to existing email account with comprehensive details
          user = userResult.rows[0];
          
          const firstName = googleUser.given_name || googleUser.name?.split(' ')[0] || googleUser.email?.split('@')[0] || 'User';
          const lastName = googleUser.family_name || (googleUser.name?.split(' ').length > 1 ? googleUser.name.split(' ').slice(1).join(' ') : '');
          const username = googleUser.name || googleUser.email?.split('@')[0] || `google_user_${googleUser.id}`;
          const avatarUrl = googleUser.picture || null;
          
          await query(`
            UPDATE users 
            SET google_id = $1, google_email = $2, google_avatar = $3, 
                first_name = COALESCE(NULLIF(first_name, ''), $4),
                last_name = COALESCE(NULLIF(last_name, ''), $5),
                username = COALESCE(NULLIF(username, ''), $6),
                avatar_url = COALESCE(NULLIF(avatar_url, ''), $7),
                auth_provider = 'google', last_login = CURRENT_TIMESTAMP 
            WHERE id = $8
          `, [
            googleUser.id,
            googleUser.email,
            avatarUrl,
            firstName,
            lastName,
            formatUsername(username),
            avatarUrl,
            user.id
          ]);
          
          // Update user object with latest data
          user.google_id = googleUser.id;
          user.google_email = googleUser.email;
          user.google_avatar = avatarUrl;
          user.first_name = user.first_name || firstName;
          user.last_name = user.last_name || lastName;
          user.username = user.username || username;
          user.avatar_url = user.avatar_url || avatarUrl;
        }
      }
      
      if (!user) {
        // Create new user with extracted names  
        // Google provides given_name and family_name, fallback to name or email
        const firstName = googleUser.given_name || googleUser.name?.split(' ')[0] || googleUser.email?.split('@')[0] || 'User';
        const lastName = googleUser.family_name || (googleUser.name?.split(' ').length > 1 ? googleUser.name.split(' ').slice(1).join(' ') : '');

        const avatarUrl = googleUser.picture || null;
        
        const insertResult = await query(`
          INSERT INTO users (
            email, username, first_name, last_name, avatar_url, google_id, google_email, google_avatar, 
            auth_provider, is_active, email_verified, created_at, last_login
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `, [
          googleUser.email || `google_${googleUser.id}@google.temp`,
          formatUsername(googleUser.name || googleUser.email?.split('@')[0] || `google_user_${googleUser.id}`),
          firstName,
          lastName,
          avatarUrl, // Set as primary avatar_url
          googleUser.id,
          googleUser.email,
          avatarUrl,
          'google',
          true,
          googleUser.verified_email || false
        ]);
        
        user = insertResult.rows[0];
      }
    }

    // Set authentication cookies
    setAuthCookies(res, user.id, true); // Remember Google users

    // Redirect to home page
    res.redirect(`${SITE_URL}/`);
    
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${SITE_URL}/auth?error=google_authentication_error`);
  }
}