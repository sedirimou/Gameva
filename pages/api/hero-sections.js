/**
 * Frontend Hero Sections API
 * Fetches active hero sections for homepage display
 */
import { query } from '../../lib/database';
import { monitorAPIRoute } from '../../lib/apiMonitor';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      'SELECT * FROM hero_sections WHERE is_active = true ORDER BY position ASC, created_at ASC'
    );

    return res.status(200).json({
      success: true,
      heroes: result.rows
    });
  } catch (error) {
    console.error('Fetch hero sections error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch hero sections',
      details: error.message 
    });
  }
}

export default monitorAPIRoute(handler);