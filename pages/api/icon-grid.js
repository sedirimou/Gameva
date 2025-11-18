import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT id, icon_path, title, subtitle, redirect_link, link_target, position, is_active, created_at, updated_at
        FROM icon_grid_sections 
        WHERE is_active = true 
        ORDER BY position ASC, id ASC
        LIMIT 6
      `);

      return res.status(200).json({
        success: true,
        icons: result.rows
      });
    } catch (error) {
      console.error('Error fetching icon grid:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch icon grid'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}