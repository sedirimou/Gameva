import { query } from '../../lib/database.js';

export default async function handler(req, res) {
  try {
    // Simple ping query to keep Neon database awake
    const result = await query('SELECT 1 as ping');
    
    res.status(200).json({ 
      status: 'success', 
      message: 'Neon database is awake',
      timestamp: new Date().toISOString(),
      ping: result.rows[0].ping
    });
  } catch (error) {
    console.error('Neon ping failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to ping Neon database',
      error: error.message 
    });
  }
}