/**
 * Admin Settings API
 * Handles general admin settings operations
 */
import { query } from '../../../lib/database';
import { requireAdmin } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    // Require admin authentication
    const user = await requireAdmin(req, res);
    if (!user) {
      return; // requireAdmin already sent the error response
    }

    if (req.method === 'GET') {
      // Get all admin settings
      const settingsQuery = `
        SELECT setting_key, setting_value, category, updated_at
        FROM admin_settings 
        ORDER BY category, setting_key
      `;
      
      try {
        const result = await query(settingsQuery);
        
        const settings = {};
        result.rows.forEach(row => {
          if (!settings[row.category]) {
            settings[row.category] = {};
          }
          settings[row.category][row.setting_key] = row.setting_value;
        });

        return res.status(200).json({ 
          success: true,
          settings
        });
      } catch (dbError) {
        // If admin_settings table doesn't exist, return default structure
        return res.status(200).json({ 
          success: true,
          settings: {
            general: {
              site_name: 'Gamava',
              site_description: 'Digital Gaming Marketplace',
              maintenance_mode: 'false'
            },
            email: {
              smtp_host: '',
              smtp_port: '587',
              smtp_user: '',
              smtp_password: ''
            }
          }
        });
      }

    } else if (req.method === 'PUT') {
      // Update admin settings
      const { category, settings } = req.body;

      if (!category || !settings || typeof settings !== 'object') {
        return res.status(400).json({ 
          error: 'Category and settings object are required' 
        });
      }

      try {
        // Begin transaction
        await query('BEGIN');

        // Create admin_settings table if it doesn't exist
        await query(`
          CREATE TABLE IF NOT EXISTS admin_settings (
            id SERIAL PRIMARY KEY,
            setting_key VARCHAR(255) NOT NULL,
            setting_value TEXT,
            category VARCHAR(100) NOT NULL DEFAULT 'general',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(setting_key, category)
          )
        `);

        // Delete existing settings for this category
        await query('DELETE FROM admin_settings WHERE category = $1', [category]);

        // Insert new settings
        for (const [key, value] of Object.entries(settings)) {
          if (value !== null && value !== undefined) { // Allow empty strings but not null/undefined
            await query(
              `INSERT INTO admin_settings (setting_key, setting_value, category, updated_at) 
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
              [key, String(value), category]
            );
          }
        }

        await query('COMMIT');
        return res.status(200).json({ 
          success: true,
          message: `Settings for ${category} updated successfully` 
        });

      } catch (error) {
        await query('ROLLBACK');
        console.error('Settings update error:', error);
        return res.status(500).json({ 
          error: 'Failed to update settings',
          details: error.message 
        });
      }

    } else if (req.method === 'DELETE') {
      // Delete specific category settings
      const { category } = req.body;

      if (!category) {
        return res.status(400).json({ 
          error: 'Category is required for deletion' 
        });
      }

      try {
        const result = await query('DELETE FROM admin_settings WHERE category = $1', [category]);
        
        return res.status(200).json({ 
          success: true,
          message: `Deleted ${result.rowCount} settings from ${category} category`
        });
      } catch (error) {
        console.error('Settings deletion error:', error);
        return res.status(500).json({ 
          error: 'Failed to delete settings',
          details: error.message 
        });
      }

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Admin settings API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Contact administrator'
    });
  }
}