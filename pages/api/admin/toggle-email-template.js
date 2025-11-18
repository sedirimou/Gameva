import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
  }
  
  try {
    const { id, is_enabled } = req.body;
    
    if (!id || typeof is_enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Template ID and enabled status are required'
      });
    }
    
    const result = await query(`
      UPDATE email_templates 
      SET 
        is_enabled = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [is_enabled, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `Template ${is_enabled ? 'enabled' : 'disabled'} successfully`,
      template: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling email template status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template status'
    });
  }
}