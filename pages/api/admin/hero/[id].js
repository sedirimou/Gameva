/**
 * Hero Section Individual Management API
 * Handles PUT and DELETE operations for specific hero sections
 */
import { query } from '../../../../lib/database';
import { monitorAPIRoute } from '../../../../lib/apiMonitor';

async function handler(req, res) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Hero ID is required' });
    }

    if (req.method === 'PUT') {
      return await handlePut(req, res);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res);
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Hero ID API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Contact administrator'
    });
  }
}

// Handle PUT requests for updating specific hero sections
async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const { title, image, button_label, link, position, is_active } = req.body;

    // Validate required fields
    if (!image || !button_label || !link) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['image', 'button_label', 'link']
      });
    }

    const result = await query(
      `UPDATE hero_sections 
       SET title = $1, image = $2, button_label = $3, link = $4, position = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title || '', image, button_label, link, position || 1, is_active !== false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hero section not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Hero section updated successfully',
      hero: result.rows[0]
    });
  } catch (error) {
    console.error('Update hero error:', error);
    return res.status(500).json({ 
      error: 'Failed to update hero section',
      details: error.message 
    });
  }
}

// Handle DELETE requests for removing specific hero sections
async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    const result = await query(
      'DELETE FROM hero_sections WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hero section not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Hero section deleted successfully',
      hero: result.rows[0]
    });
  } catch (error) {
    console.error('Delete hero error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete hero section',
      details: error.message 
    });
  }
}

export default monitorAPIRoute(handler);