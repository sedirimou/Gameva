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
        l.id, 
        l.name as title, 
        l.flag_url, 
        l.created_at,
        COUNT(pl.product_id) as product_count
      FROM languages l
      LEFT JOIN product_languages pl ON l.id = pl.language_id
      GROUP BY l.id, l.name, l.flag_url, l.created_at
      ORDER BY l.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
}

async function handlePost(req, res) {
  try {
    const { title, flag_url } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO languages (name, flag_url)
      VALUES ($1, $2)
      RETURNING id, name as title, flag_url, created_at
    `, [title, flag_url || null]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating language:', error);
    res.status(500).json({ error: 'Failed to create language' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title, flag_url } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE languages 
      SET name = $1, flag_url = $2
      WHERE id = $3
      RETURNING id, name as title, flag_url, created_at
    `, [title, flag_url || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating language:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Check if language has associated products
    const productCheck = await query(`
      SELECT COUNT(*) as count FROM product_languages WHERE language_id = $1
    `, [id]);
    
    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete language with associated products' 
      });
    }
    
    const result = await query(`
      DELETE FROM languages WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({ error: 'Failed to delete language' });
  }
}