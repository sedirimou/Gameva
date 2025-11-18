import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM cookie_consent_settings 
        ORDER BY created_at DESC 
        LIMIT 1
      `);

      return res.status(200).json({
        success: true,
        settings: result.rows[0] || {}
      });
    } catch (error) {
      console.error('Error fetching cookie consent settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch cookie consent settings'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        banner_title,
        banner_description,
        accept_all_text,
        accept_necessary_text,
        settings_text,
        close_text,
        position,
        layout,
        transition,
        theme_color,
        button_color,
        is_enabled,
        essential_cookies_description,
        analytics_cookies_description,
        marketing_cookies_description
      } = req.body;

      // Validate and sanitize color values
      const sanitizeColor = (color) => {
        if (!color) return '#153e8f';
        // Remove any extra spaces and ensure it starts with #
        let cleanColor = color.trim();
        if (!cleanColor.startsWith('#')) {
          cleanColor = '#' + cleanColor;
        }
        // Ensure it's a valid hex color (6 characters after #)
        if (!/^#[0-9A-Fa-f]{6}$/.test(cleanColor)) {
          return '#153e8f'; // Default fallback
        }
        return cleanColor;
      };

      const sanitizedThemeColor = sanitizeColor(theme_color);
      const sanitizedButtonColor = sanitizeColor(button_color);

      // Check if settings exist
      const existing = await query('SELECT id FROM cookie_consent_settings LIMIT 1');
      
      let result;
      if (existing.rows.length > 0) {
        // Update existing settings
        result = await query(`
          UPDATE cookie_consent_settings 
          SET banner_title = $1,
              banner_description = $2,
              accept_all_text = $3,
              accept_necessary_text = $4,
              settings_text = $5,
              close_text = $6,
              position = $7,
              layout = $8,
              transition = $9,
              theme_color = $10,
              button_color = $11,
              is_enabled = $12,
              essential_cookies_description = $13,
              analytics_cookies_description = $14,
              marketing_cookies_description = $15,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $16
          RETURNING *
        `, [
          banner_title,
          banner_description,
          accept_all_text,
          accept_necessary_text,
          settings_text,
          close_text,
          position,
          layout,
          transition,
          sanitizedThemeColor,
          sanitizedButtonColor,
          is_enabled,
          essential_cookies_description || 'Required for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility.',
          analytics_cookies_description || 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
          marketing_cookies_description || 'Used to deliver personalized advertisements and track the effectiveness of advertising campaigns.',
          existing.rows[0].id
        ]);
      } else {
        // Create new settings
        result = await query(`
          INSERT INTO cookie_consent_settings (
            banner_title, banner_description, accept_all_text, accept_necessary_text,
            settings_text, close_text, position, layout, transition, theme_color,
            button_color, is_enabled, essential_cookies_description, 
            analytics_cookies_description, marketing_cookies_description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *
        `, [
          banner_title,
          banner_description,
          accept_all_text,
          accept_necessary_text,
          settings_text,
          close_text,
          position,
          layout,
          transition,
          sanitizedThemeColor,
          sanitizedButtonColor,
          is_enabled,
          essential_cookies_description || 'Required for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility.',
          analytics_cookies_description || 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
          marketing_cookies_description || 'Used to deliver personalized advertisements and track the effectiveness of advertising campaigns.'
        ]);
      }

      return res.status(200).json({
        success: true,
        settings: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating cookie consent settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update cookie consent settings'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}