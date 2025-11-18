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
        g.id, 
        g.name as title, 
        g.icon_url, 
        g.description, 
        g.is_featured,
        g.created_at,
        COUNT(pg.product_id) as product_count
      FROM genres g
      LEFT JOIN product_genres pg ON g.id = pg.genre_id
      GROUP BY g.id, g.name, g.icon_url, g.description, g.is_featured, g.created_at
      ORDER BY g.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
}

async function handlePost(req, res) {
  try {
    const { title, icon_url, description, is_featured } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO genres (name, icon_url, description, is_featured)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name as title, icon_url, description, is_featured, created_at
    `, [title, icon_url || null, description || null, is_featured || false]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating genre:', error);
    res.status(500).json({ error: 'Failed to create genre' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title, icon_url, description, is_featured } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE genres 
      SET name = $1, icon_url = $2, description = $3, is_featured = $4
      WHERE id = $5
      RETURNING id, name as title, icon_url, description, is_featured, created_at
    `, [title, icon_url || null, description || null, is_featured || false, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating genre:', error);
    res.status(500).json({ error: 'Failed to update genre' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Check if genre has associated products
    const productCheck = await query(`
      SELECT COUNT(*) as count FROM product_genres WHERE genre_id = $1
    `, [id]);
    
    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete genre with associated products' 
      });
    }
    
    const result = await query(`
      DELETE FROM genres WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    
    res.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error('Error deleting genre:', error);
    res.status(500).json({ error: 'Failed to delete genre' });
  }
}