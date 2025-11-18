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
        p.id, 
        p.title, 
        p.icon_url, 
        p.description, 
        p.is_featured,
        p.created_at,
        COUNT(pp.product_id) as product_count
      FROM platforms p
      LEFT JOIN product_platforms pp ON p.id = pp.platform_id
      GROUP BY p.id, p.title, p.icon_url, p.description, p.is_featured, p.created_at
      ORDER BY p.title
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
}

async function handlePost(req, res) {
  try {
    const { title, icon_url, description, is_featured } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO platforms (title, icon_url, description, is_featured)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, icon_url || null, description || null, is_featured || false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating platform:', error);
    res.status(500).json({ error: 'Failed to create platform' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title, icon_url, description, is_featured } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE platforms 
      SET title = $1, icon_url = $2, description = $3, is_featured = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [title, icon_url || null, description || null, is_featured || false, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating platform:', error);
    res.status(500).json({ error: 'Failed to update platform' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Check if platform has associated products
    const productCheck = await query(`
      SELECT COUNT(*) as count FROM product_platforms WHERE platform_id = $1
    `, [id]);
    
    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete platform with associated products' 
      });
    }
    
    const result = await query(`
      DELETE FROM platforms WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Platform not found' });
    }
    
    res.json({ message: 'Platform deleted successfully' });
  } catch (error) {
    console.error('Error deleting platform:', error);
    res.status(500).json({ error: 'Failed to delete platform' });
  }
}