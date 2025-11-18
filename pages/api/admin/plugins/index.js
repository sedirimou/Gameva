/**
 * Admin Plugins API
 * Handles plugin listing, status management, and configuration
 */
import { query } from '../../../../lib/database';
import { requireAdmin } from '../../../../lib/auth';

export default async function handler(req, res) {
  try {
    // Require admin authentication
    const user = await requireAdmin(req, res);
    if (!user) {
      return; // requireAdmin already sent the error response
    }

    if (req.method === 'GET') {
      // Get all plugins with their settings grouped
      const pluginsQuery = `
        SELECT 
          plugin_name,
          status,
          mode,
          COUNT(*) as setting_count,
          MAX(updated_at) as last_updated
        FROM plugin_settings 
        GROUP BY plugin_name, status, mode
        ORDER BY plugin_name
      `;
      
      const pluginsResult = await query(pluginsQuery);
      
      // Define available plugins and their required settings
      const availablePlugins = {
        stripe: {
          name: 'Stripe',
          description: 'Payment processing and subscription management',
          required_settings: {
            test: ['test_publishable_key', 'test_secret_key', 'test_webhook_secret'],
            live: ['live_publishable_key', 'live_secret_key', 'live_webhook_secret']
          },
          has_mode: true
        },
        recaptcha: {
          name: 'Google reCAPTCHA',
          description: 'Bot protection and spam prevention',
          required_settings: {
            default: ['site_key', 'secret_key']
          },
          has_mode: false
        },
        analytics: {
          name: 'Google Analytics',
          description: 'Website traffic and user behavior analytics',
          required_settings: {
            default: ['tracking_id', 'measurement_id']
          },
          has_mode: false
        },

      };

      // Merge database data with available plugins
      const plugins = Object.keys(availablePlugins).map(pluginKey => {
        const pluginData = availablePlugins[pluginKey];
        const dbData = pluginsResult.rows.find(p => p.plugin_name === pluginKey);
        
        return {
          key: pluginKey,
          name: pluginData.name,
          description: pluginData.description,
          status: dbData?.status || 'inactive',
          mode: dbData?.mode || (pluginData.has_mode ? 'test' : null),
          has_mode: pluginData.has_mode,
          required_settings: pluginData.required_settings,
          setting_count: dbData?.setting_count || 0,
          last_updated: dbData?.last_updated || null
        };
      });

      return res.status(200).json({ plugins });

    } else if (req.method === 'POST') {
      // Create or update plugin settings
      const { plugin_name, settings, status, mode } = req.body;

      if (!plugin_name || !settings) {
        return res.status(400).json({ error: 'Plugin name and settings are required' });
      }

      // Begin transaction
      const client = await query('BEGIN');
      
      try {
        // Delete existing settings for this plugin
        await query('DELETE FROM plugin_settings WHERE plugin_name = $1', [plugin_name]);

        // Insert new settings
        for (const [key, value] of Object.entries(settings)) {
          if (value && value.trim()) { // Only save non-empty values
            await query(
              `INSERT INTO plugin_settings (plugin_name, setting_key, setting_value, status, mode, updated_at) 
               VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
              [plugin_name, key, value, status || 'active', mode || null]
            );
          }
        }

        await query('COMMIT');
        return res.status(200).json({ message: 'Plugin settings updated successfully' });

      } catch (error) {
        await query('ROLLBACK');
        throw error;
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Plugins API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}