import { config, SITE_URL } from '../../../lib/config.js';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1387888288219664444';
const DISCORD_OAUTH_URL = 'https://discord.com/oauth2/authorize';
const REDIRECT_URI = `${SITE_URL}/api/auth/discord/callback`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Build Discord OAuth URL
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: 'identify email'
    });

    const discordAuthUrl = `${DISCORD_OAUTH_URL}?${params.toString()}`;
    
    console.log('Redirecting to Discord OAuth:', discordAuthUrl);
    res.redirect(discordAuthUrl);
    
  } catch (error) {
    console.error('Discord OAuth initiation error:', error);
    res.redirect(`${SITE_URL}/auth?error=discord_oauth_failed`);
  }
}