import { query } from '../../../../lib/database';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    const result = await query(`
      SELECT 
        ar.id, 
        ar.title, 
        ar.secondary_title,
        ar.description,
        ar.icon_url, 
        ar.created_at,
        0 as product_count
      FROM age_ratings ar
      ORDER BY ar.title
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching age ratings:', error);
    res.status(500).json({ error: 'Failed to fetch age ratings' });
  }
}

async function handlePost(req, res) {
  try {
    const { title, secondary_title, description, icon_url } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO age_ratings (title, secondary_title, description, icon_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, secondary_title || null, description || null, icon_url || null]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating age rating:', error);
    res.status(500).json({ error: 'Failed to create age rating' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title, secondary_title, description, icon_url } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE age_ratings 
      SET title = $1, secondary_title = $2, description = $3, icon_url = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [title, secondary_title || null, description || null, icon_url || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Age rating not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating age rating:', error);
    res.status(500).json({ error: 'Failed to update age rating' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    const result = await query(`
      DELETE FROM age_ratings WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Age rating not found' });
    }
    
    res.json({ message: 'Age rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting age rating:', error);
    res.status(500).json({ error: 'Failed to delete age rating' });
  }
}