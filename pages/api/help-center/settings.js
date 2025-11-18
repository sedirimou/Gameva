import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT setting_key, setting_value, setting_type
        FROM help_settings
        ORDER BY setting_key ASC
      `);

      // Convert to key-value object for easier frontend use
      const settings = {};
      result.rows.forEach(row => {
        let value = row.setting_value;
        if (row.setting_type === 'boolean') {
          value = value === 'true';
        } else if (row.setting_type === 'number') {
          value = parseInt(value);
        } else if (row.setting_type === 'json') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        settings[row.setting_key] = value;
      });

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching help settings:', error);
      res.status(500).json({ error: 'Failed to fetch help settings' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}