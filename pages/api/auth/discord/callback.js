import { query } from '../../../../lib/database.js';
import { setAuthCookies, formatUsername } from '../../../../lib/auth.js';
import { config, SITE_URL } from '../../../../lib/config.js';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1387888288219664444';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = `${SITE_URL}/api/auth/discord/callback`;

// Validate required environment variables
if (!DISCORD_CLIENT_SECRET) {
  console.error('DISCORD_CLIENT_SECRET environment variable is required for Discord OAuth');
}

async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord token exchange failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Discord token exchange error:', error);
    throw error;
  }
}

async function getDiscordUserInfo(accessToken) {
  try {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Discord user info failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Discord user info error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if required environment variables are set
    if (!DISCORD_CLIENT_SECRET) {
      console.error('DISCORD_CLIENT_SECRET environment variable is not configured');
      return res.redirect(`${SITE_URL}/auth?error=discord_config_missing`);
    }

    const { code, error } = req.query;

    if (error) {
      console.error('Discord OAuth error:', error);
      return res.redirect(`${SITE_URL}/auth?error=discord_oauth_denied`);
    }

    if (!code) {
      console.error('No authorization code received from Discord');
      return res.redirect(`${SITE_URL}/auth?error=discord_no_code`);
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);
    
    if (!tokenData.access_token) {
      console.error('No access token received from Discord');
      return res.redirect(`${SITE_URL}/auth?error=discord_token_failed`);
    }

    // Get user info from Discord
    const discordUser = await getDiscordUserInfo(tokenData.access_token);
    
    if (!discordUser.id) {
      console.error('Could not retrieve Discord user info');
      return res.redirect(`${SITE_URL}/auth?error=discord_user_info_failed`);
    }

    // Check if user already exists with this Discord ID
    let userResult = await query(
      'SELECT * FROM users WHERE discord_id = $1',
      [discordUser.id]
    );

    let user;
    if (userResult.rows.length > 0) {
      // Update existing user with comprehensive details
      user = userResult.rows[0];
      
      // Extract names for existing users if not already set
      const displayName = discordUser.global_name || discordUser.display_name || discordUser.username || `DiscordUser${discordUser.id}`;
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || displayName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      const avatarUrl = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null;
      
      await query(`
        UPDATE users 
        SET discord_username = $1, discord_avatar = $2,
            first_name = COALESCE(NULLIF(first_name, ''), $3),
            last_name = COALESCE(NULLIF(last_name, ''), $4),
            username = COALESCE(NULLIF(username, ''), $5),
            avatar_url = COALESCE(NULLIF(avatar_url, ''), $6),
            email = COALESCE(NULLIF(email, ''), $7),
            last_login = CURRENT_TIMESTAMP 
        WHERE id = $8
      `, [
        discordUser.username,
        avatarUrl,
        firstName,
        lastName,
        formatUsername(discordUser.username),
        avatarUrl,
        discordUser.email,
        user.id
      ]);
      
      // Update user object with latest data
      user.discord_username = discordUser.username;
      user.discord_avatar = avatarUrl;
      user.first_name = user.first_name || firstName;
      user.last_name = user.last_name || lastName;
      user.username = user.username || discordUser.username;
      user.avatar_url = user.avatar_url || avatarUrl;
      user.email = user.email || discordUser.email;
    } else {
      // Check if user exists with same email
      if (discordUser.email) {
        userResult = await query(
          'SELECT * FROM users WHERE email = $1',
          [discordUser.email]
        );
        
        if (userResult.rows.length > 0) {
          // Link Discord to existing email account with comprehensive details
          user = userResult.rows[0];
          
          const displayName = discordUser.global_name || discordUser.display_name || discordUser.username || `DiscordUser${discordUser.id}`;
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || displayName;
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          const avatarUrl = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null;
          
          await query(`
            UPDATE users 
            SET discord_id = $1, discord_username = $2, discord_avatar = $3, 
                first_name = COALESCE(NULLIF(first_name, ''), $4),
                last_name = COALESCE(NULLIF(last_name, ''), $5),
                username = COALESCE(NULLIF(username, ''), $6),
                avatar_url = COALESCE(NULLIF(avatar_url, ''), $7),
                auth_provider = 'discord', last_login = CURRENT_TIMESTAMP 
            WHERE id = $8
          `, [
            discordUser.id,
            discordUser.username,
            avatarUrl,
            firstName,
            lastName,
            formatUsername(discordUser.username),
            avatarUrl,
            user.id
          ]);
          
          // Update user object with latest data
          user.discord_id = discordUser.id;
          user.discord_username = discordUser.username;
          user.discord_avatar = avatarUrl;
          user.first_name = user.first_name || firstName;
          user.last_name = user.last_name || lastName;
          user.username = user.username || discordUser.username;
          user.avatar_url = user.avatar_url || avatarUrl;
        }
      }
      
      if (!user) {
        // Create new user with extracted names
        // Discord provides display_name and global_name, fallback to username
        const displayName = discordUser.global_name || discordUser.display_name || discordUser.username || `DiscordUser${discordUser.id}`;
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || displayName;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const avatarUrl = discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null;
        
        const insertResult = await query(`
          INSERT INTO users (
            email, username, first_name, last_name, avatar_url, discord_id, discord_username, discord_avatar, 
            auth_provider, is_active, email_verified, created_at, last_login
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *
        `, [
          discordUser.email || `discord_${discordUser.id}@discord.temp`,
          formatUsername(discordUser.username),
          firstName,
          lastName,
          avatarUrl, // Set as primary avatar_url
          discordUser.id,
          discordUser.username,
          avatarUrl,
          'discord',
          true,
          discordUser.verified || false
        ]);
        
        user = insertResult.rows[0];
      }
    }

    // Set authentication cookies
    setAuthCookies(res, user.id, true); // Remember Discord users

    // Redirect to home page
    res.redirect(`${SITE_URL}/`);
    
  } catch (error) {
    console.error('Discord callback error:', error);
    res.redirect(`${SITE_URL}/auth?error=discord_authentication_error`);
  }
}