import { Issuer, Strategy } from 'openid-client';
import { query } from '../../../lib/database.js';
import { config, SITE_URL } from '../../../lib/config.js';

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid';
const REALM = SITE_URL;
const RETURN_URL = `${SITE_URL}/api/auth/steam/callback`;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Create Steam OpenID URL
      const steamUrl = `${STEAM_OPENID_URL}/login?` + new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': RETURN_URL,
        'openid.realm': REALM,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
      });

      // Redirect user to Steam
      res.redirect(302, steamUrl);
    } catch (error) {
      console.error('Steam auth initiation error:', error);
      res.status(500).json({ error: 'Failed to initiate Steam authentication' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}