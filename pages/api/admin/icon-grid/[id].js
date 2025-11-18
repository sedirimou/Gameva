import { query } from '../../../../lib/database';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT id, icon_path, title, subtitle, redirect_link, link_target, position, is_active, created_at, updated_at
        FROM icon_grid_sections 
        WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Icon not found'
        });
      }

      return res.status(200).json({
        success: true,
        icon: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching icon:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch icon'
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, subtitle, icon_path, redirect_link, link_target, position, is_active } = req.body;

      if (!icon_path) {
        return res.status(400).json({
          success: false,
          message: 'Icon path is required'
        });
      }

      const result = await query(`
        UPDATE icon_grid_sections 
        SET icon_path = $1, title = $2, subtitle = $3, redirect_link = $4, link_target = $5, position = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `, [
        icon_path,
        title || null,
        subtitle || null,
        redirect_link || null,
        link_target || '_self',
        position || 1,
        is_active !== undefined ? is_active : true,
        id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Icon not found'
        });
      }

      return res.status(200).json({
        success: true,
        icon: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating icon:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update icon'
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await query(`
        DELETE FROM icon_grid_sections 
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Icon not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Icon deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting icon:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete icon'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
}