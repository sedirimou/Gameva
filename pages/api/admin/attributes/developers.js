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
        d.id, 
        d.name as title, 
        d.created_at,
        COUNT(pd.product_id) as product_count
      FROM developers d
      LEFT JOIN product_developers pd ON d.id = pd.developer_id
      GROUP BY d.id, d.name, d.created_at
      ORDER BY d.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching developers:', error);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
}

async function handlePost(req, res) {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO developers (name)
      VALUES ($1)
      RETURNING id, name as title, created_at
    `, [title]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating developer:', error);
    res.status(500).json({ error: 'Failed to create developer' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE developers 
      SET name = $1
      WHERE id = $2
      RETURNING id, name as title, created_at
    `, [title, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating developer:', error);
    res.status(500).json({ error: 'Failed to update developer' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Check if developer has associated products
    const productCheck = await query(`
      SELECT COUNT(*) as count FROM product_developers WHERE developer_id = $1
    `, [id]);
    
    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete developer with associated products' 
      });
    }
    
    const result = await query(`
      DELETE FROM developers WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Developer not found' });
    }
    
    res.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    console.error('Error deleting developer:', error);
    res.status(500).json({ error: 'Failed to delete developer' });
  }
}