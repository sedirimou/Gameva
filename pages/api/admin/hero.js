/**
 * Hero Section Management API
 * Handles CRUD operations for hero banners in admin panel
 */
import { query } from '../../../lib/database';
import { monitorAPIRoute } from '../../../lib/apiMonitor';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    } else if (req.method === 'POST') {
      return await handlePost(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Hero API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Contact administrator'
    });
  }
}

async function handleGet(req, res) {
  try {
    const result = await query(
      'SELECT * FROM hero_sections ORDER BY position ASC, created_at DESC'
    );

    return res.status(200).json({
      success: true,
      heroes: result.rows
    });
  } catch (error) {
    console.error('Get heroes error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch hero sections',
      details: error.message 
    });
  }
}

async function handlePost(req, res) {
  try {
    const { title, image, button_label, link, position, is_active } = req.body;

    // Validate required fields (title is now optional)
    if (!image || !button_label || !link) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'image, button_label, and link are required'
      });
    }

    // Validate position is a number
    const positionValue = position !== undefined ? parseInt(position) : 0;
    if (isNaN(positionValue)) {
      return res.status(400).json({
        error: 'Invalid position value',
        details: 'Position must be a valid number'
      });
    }

    const result = await query(
      `INSERT INTO hero_sections (title, image, button_label, link, position, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [title, image, button_label, link, positionValue, is_active !== false]
    );

    return res.status(201).json({
      success: true,
      message: 'Hero section created successfully',
      hero: result.rows[0]
    });
  } catch (error) {
    console.error('Create hero error:', error);
    return res.status(500).json({ 
      error: 'Failed to create hero section',
      details: error.message 
    });
  }
}



export default monitorAPIRoute(handler);