import { query } from '../../../../lib/database.js';
import { setAuthCookies, formatUsername } from '../../../../lib/auth.js';
import { config, SITE_URL } from '../../../../lib/config.js';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

async function verifyAssertion(params) {
  // Prepare verification parameters
  const verifyParams = { ...params };
  verifyParams['openid.mode'] = 'check_authentication';

  // Send verification request to Steam
  const response = await fetch(STEAM_OPENID_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(verifyParams),
  });

  const result = await response.text();
  return result.includes('is_valid:true');
}

function extractSteamId(claimedId) {
  // Extract Steam ID from claimed_id URL
  const match = claimedId.match(/\/id\/(\d+)$/);
  return match ? match[1] : null;
}

async function getSteamUserInfo(steamId) {
  // Get Steam API key from environment variables
  const steamApiKey = process.env.STEAM_API_KEY;
  if (!steamApiKey) {
    throw new Error('Steam API key not configured');
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    const data = await response.json();
    
    if (data.response && data.response.players && data.response.players.length > 0) {
      return data.response.players[0];
    }
    
    return null;
  } catch (error) {
    console.error('Steam API error:', error);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const params = req.query;

      // Verify the assertion with Steam
      const isValid = await verifyAssertion(params);
      
      if (!isValid) {
        console.error('Steam authentication verification failed');
        return res.redirect(`${SITE_URL}/auth?error=steam_verification_failed`);
      }

      // Extract Steam ID from claimed_id
      const steamId = extractSteamId(params['openid.claimed_id']);
      
      if (!steamId) {
        console.error('Could not extract Steam ID');
        return res.redirect(`${SITE_URL}/auth?error=steam_id_extraction_failed`);
      }

      // Get user info from Steam API
      const steamUserInfo = await getSteamUserInfo(steamId);
      
      if (!steamUserInfo) {
        console.error('Could not retrieve Steam user info');
        return res.redirect(`${SITE_URL}/auth?error=steam_user_info_failed`);
      }

      // Check if user already exists with this Steam ID
      let userResult = await query(
        'SELECT * FROM users WHERE steam_id = $1',
        [steamId]
      );

      let user;
      
      if (userResult.rows.length > 0) {
        // User exists, update their info and login time
        user = userResult.rows[0];
        
        // Extract names for existing users if not already set
        const displayName = steamUserInfo.personaname || `SteamUser${steamId}`;
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || displayName;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        await query(
          `UPDATE users 
           SET steam_username = $1, steam_avatar = $2, 
               first_name = COALESCE(NULLIF(first_name, ''), $3),
               last_name = COALESCE(NULLIF(last_name, ''), $4),
               username = COALESCE(NULLIF(username, ''), $5),
               avatar_url = COALESCE(NULLIF(avatar_url, ''), $6),
               last_login = NOW() 
           WHERE steam_id = $7`,
          [steamUserInfo.personaname, steamUserInfo.avatarfull, firstName, lastName, formatUsername(steamUserInfo.personaname), steamUserInfo.avatarfull, steamId]
        );
        
        // Update user object with latest data
        user.steam_username = steamUserInfo.personaname;
        user.steam_avatar = steamUserInfo.avatarfull;
        user.first_name = user.first_name || firstName;
        user.last_name = user.last_name || lastName;
        user.username = user.username || steamUserInfo.personaname;
        user.avatar_url = user.avatar_url || steamUserInfo.avatarfull;
      } else {
        // Create new user account with extracted names
        // Try to extract first/last name from personaname, fallback to steam username
        const displayName = steamUserInfo.personaname || steamUserInfo.personaname || `SteamUser${steamId}`;
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || displayName;
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const insertResult = await query(
          `INSERT INTO users (
            email, 
            username, 
            first_name,
            last_name,
            avatar_url,
            steam_id, 
            steam_username, 
            steam_avatar,
            auth_provider,
            email_verified,
            is_active,
            created_at,
            last_login
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
          RETURNING *`,
          [
            `steam_${steamId}@gameva.local`, // Placeholder email
            formatUsername(steamUserInfo.personaname),
            firstName,
            lastName,
            steamUserInfo.avatarfull, // Set as primary avatar_url
            steamId,
            steamUserInfo.personaname,
            steamUserInfo.avatarfull,
            'steam',
            true, // Steam accounts are considered verified
            true
          ]
        );
        
        user = insertResult.rows[0];
      }

      // Set authentication cookies
      setAuthCookies(res, user.id, true); // Remember Steam users

      // Redirect to home page
      res.redirect(`${SITE_URL}/`);
      
    } catch (error) {
      console.error('Steam callback error:', error);
      res.redirect(`${SITE_URL}/auth?error=steam_authentication_error`);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}