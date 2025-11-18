import { config, SITE_URL } from '../../../lib/config.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '861035657088-8cqqbpu315bd685ts7r7p2arh1glgg65.apps.googleusercontent.com';
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/auth';
const REDIRECT_URI = `${SITE_URL}/api/auth/google/callback`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    const googleAuthUrl = `${GOOGLE_OAUTH_URL}?${params.toString()}`;
    
    console.log('Redirecting to Google OAuth:', googleAuthUrl);
    res.redirect(googleAuthUrl);
    
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    res.redirect(`${SITE_URL}/auth?error=google_oauth_failed`);
  }
}