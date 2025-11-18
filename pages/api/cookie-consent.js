import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM cookie_consent_settings 
        WHERE is_enabled = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      return res.status(200).json({
        success: true,
        settings: result.rows[0] || null
      });
    } catch (error) {
      console.error('Error fetching cookie consent settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch cookie consent settings'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}