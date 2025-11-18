import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT id, icon_path, title, subtitle, redirect_link, link_target, position, is_active, created_at, updated_at
        FROM icon_grid_sections 
        ORDER BY position ASC, id ASC
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
  } else if (req.method === 'POST') {
    try {
      const { title, subtitle, icon_path, redirect_link, link_target, position, is_active } = req.body;

      if (!icon_path) {
        return res.status(400).json({
          success: false,
          message: 'Icon path is required'
        });
      }

      const result = await query(`
        INSERT INTO icon_grid_sections (icon_path, title, subtitle, redirect_link, link_target, position, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        icon_path,
        title || null,
        subtitle || null,
        redirect_link || null,
        link_target || '_self',
        position || 1,
        is_active !== undefined ? is_active : true
      ]);

      return res.status(201).json({
        success: true,
        icon: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating icon:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create icon'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}