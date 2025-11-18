import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM help_settings
        ORDER BY created_at DESC
        LIMIT 1
      `);

      // Return default settings if none exist
      const settings = result.rows[0] || {
        help_center_title: 'Help Center',
        help_center_subtitle: 'Find answers to common questions and get support',
        support_email: 'support@gamava.com',
        support_phone: '+1 (555) 123-4567',
        business_hours: 'Monday - Friday, 9:00 AM - 6:00 PM EST',
        response_time: 'Within 24 hours',
        auto_response_message: 'Thank you for contacting us. We have received your message and will respond within 24 hours.',
        is_active: true
      };

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching help settings:', error);
      res.status(500).json({ error: 'Failed to fetch help settings' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        help_center_title,
        help_center_subtitle,
        support_email,
        support_phone,
        business_hours,
        response_time,
        auto_response_message,
        is_active = true
      } = req.body;

      // Check if settings exist
      const existingResult = await query('SELECT id FROM help_settings LIMIT 1');
      
      let result;
      if (existingResult.rows.length > 0) {
        // Update existing settings
        result = await query(`
          UPDATE help_settings 
          SET help_center_title = $1, help_center_subtitle = $2, support_email = $3,
              support_phone = $4, business_hours = $5, response_time = $6,
              auto_response_message = $7, is_active = $8, updated_at = NOW()
          WHERE id = $9
          RETURNING *
        `, [
          help_center_title, help_center_subtitle, support_email, support_phone,
          business_hours, response_time, auto_response_message, is_active,
          existingResult.rows[0].id
        ]);
      } else {
        // Create new settings
        result = await query(`
          INSERT INTO help_settings (
            help_center_title, help_center_subtitle, support_email, support_phone,
            business_hours, response_time, auto_response_message, is_active,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *
        `, [
          help_center_title, help_center_subtitle, support_email, support_phone,
          business_hours, response_time, auto_response_message, is_active
        ]);
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating help settings:', error);
      res.status(500).json({ error: 'Failed to update help settings' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}