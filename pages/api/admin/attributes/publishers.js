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
        p.name as title, 
        p.company_link,
        p.created_at,
        COUNT(pp.product_id) as product_count
      FROM publishers p
      LEFT JOIN product_publishers pp ON p.id = pp.publisher_id
      GROUP BY p.id, p.name, p.company_link, p.created_at
      ORDER BY p.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ error: 'Failed to fetch publishers' });
  }
}

async function handlePost(req, res) {
  try {
    const { title, company_link } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO publishers (name, company_link)
      VALUES ($1, $2)
      RETURNING id, name as title, company_link, created_at
    `, [title, company_link || null]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating publisher:', error);
    res.status(500).json({ error: 'Failed to create publisher' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title, company_link } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE publishers 
      SET name = $1, company_link = $2
      WHERE id = $3
      RETURNING id, name as title, company_link, created_at
    `, [title, company_link || null, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating publisher:', error);
    res.status(500).json({ error: 'Failed to update publisher' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Check if publisher has associated products
    const productCheck = await query(`
      SELECT COUNT(*) as count FROM product_publishers WHERE publisher_id = $1
    `, [id]);
    
    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete publisher with associated products' 
      });
    }
    
    const result = await query(`
      DELETE FROM publishers WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publisher not found' });
    }
    
    res.json({ message: 'Publisher deleted successfully' });
  } catch (error) {
    console.error('Error deleting publisher:', error);
    res.status(500).json({ error: 'Failed to delete publisher' });
  }
}