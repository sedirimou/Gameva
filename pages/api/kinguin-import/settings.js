import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get current settings
      const result = await query('SELECT * FROM kinguin_settings ORDER BY id DESC LIMIT 1');
      
      if (result.rows.length === 0) {
        // Return default settings if none exist
        return res.status(200).json({
          success: true,
          data: {
            api_key: '4d80753aff63f60103eb0764f881cd03',
            api_url: 'https://gateway.kinguin.net/esa/api/v1/products',
            platforms: [],
            genres: [],
            tags: [],
            minimum_price: 0,
            auto_update: false
          }
        });
      }

      res.status(200).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { api_key, api_url, platforms, genres, tags, minimum_price, auto_update } = req.body;

      // Check if settings exist
      const existingResult = await query('SELECT id FROM kinguin_settings ORDER BY id DESC LIMIT 1');
      
      if (existingResult.rows.length === 0) {
        // Insert new settings
        await query(
          `INSERT INTO kinguin_settings (api_key, api_url, platforms, genres, tags, minimum_price, auto_update) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [api_key, api_url, JSON.stringify(platforms || []), JSON.stringify(genres || []), JSON.stringify(tags || []), minimum_price || 0, auto_update || false]
        );
      } else {
        // Update existing settings
        await query(
          `UPDATE kinguin_settings 
           SET api_key = $1, api_url = $2, platforms = $3, genres = $4, tags = $5, minimum_price = $6, auto_update = $7, updated_at = NOW()
           WHERE id = $8`,
          [api_key, api_url, JSON.stringify(platforms || []), JSON.stringify(genres || []), JSON.stringify(tags || []), minimum_price || 0, auto_update || false, existingResult.rows[0].id]
        );
      }

      res.status(200).json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}