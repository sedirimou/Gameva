/**
 * Individual Plugin API
 * Handles specific plugin operations (get settings, update status, etc.)
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

    const { plugin } = req.query;

    if (req.method === 'GET') {
      // Get specific plugin settings
      const settingsQuery = `
        SELECT setting_key, setting_value, status, mode
        FROM plugin_settings 
        WHERE plugin_name = $1
        ORDER BY setting_key
      `;
      
      const result = await query(settingsQuery, [plugin]);
      
      const settings = {};
      let status = 'inactive';
      let mode = null;

      result.rows.forEach(row => {
        settings[row.setting_key] = row.setting_value;
        status = row.status; // All settings should have same status
        mode = row.mode; // All settings should have same mode
      });

      return res.status(200).json({ 
        plugin_name: plugin,
        settings,
        status,
        mode
      });

    } else if (req.method === 'PATCH') {
      // Update plugin status or mode
      const { status, mode } = req.body;

      if (status) {
        await query(
          'UPDATE plugin_settings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE plugin_name = $2',
          [status, plugin]
        );
      }

      if (mode !== undefined) {
        await query(
          'UPDATE plugin_settings SET mode = $1, updated_at = CURRENT_TIMESTAMP WHERE plugin_name = $2',
          [mode, plugin]
        );
      }

      return res.status(200).json({ message: `Plugin ${plugin} updated successfully` });

    } else if (req.method === 'DELETE') {
      // Delete plugin settings
      await query('DELETE FROM plugin_settings WHERE plugin_name = $1', [plugin]);
      return res.status(200).json({ message: `Plugin ${plugin} deleted successfully` });

    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error(`Plugin ${plugin} API error:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}