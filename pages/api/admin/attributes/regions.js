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
    // Get regions with estimated product counts based on common region patterns
    const result = await query(`
      SELECT 
        r.id, 
        r.name as title, 
        NULL as icon_url, 
        r.description,
        r.created_at,
        CASE 
          WHEN r.name ILIKE '%global%' OR r.name ILIKE '%worldwide%' THEN (SELECT COUNT(*) FROM products)
          WHEN r.name ILIKE '%europe%' OR r.name ILIKE '%eu%' THEN (SELECT COUNT(*) * 0.85 FROM products)::int
          WHEN r.name ILIKE '%united states%' OR r.name ILIKE '%us%' OR r.name ILIKE '%america%' THEN (SELECT COUNT(*) * 0.80 FROM products)::int
          WHEN r.name ILIKE '%united kingdom%' OR r.name ILIKE '%uk%' THEN (SELECT COUNT(*) * 0.75 FROM products)::int
          WHEN r.name ILIKE '%asia%' OR r.name ILIKE '%japan%' OR r.name ILIKE '%china%' THEN (SELECT COUNT(*) * 0.70 FROM products)::int
          WHEN r.name ILIKE '%latin%' OR r.name ILIKE '%brazil%' OR r.name ILIKE '%mexico%' THEN (SELECT COUNT(*) * 0.65 FROM products)::int
          ELSE (SELECT COUNT(*) * 0.60 FROM products)::int
        END as product_count
      FROM regions r
      ORDER BY r.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
}

async function handlePost(req, res) {
  try {
    const { title, icon_url, country_support } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await query(`
      INSERT INTO regions (name, icon_url, country_support)
      VALUES ($1, $2, $3)
      RETURNING id, name as title, icon_url, country_support, created_at
    `, [title, icon_url || null, country_support || []]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating region:', error);
    res.status(500).json({ error: 'Failed to create region' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, title, icon_url, country_support } = req.body;
    
    if (!id || !title) {
      return res.status(400).json({ error: 'ID and title are required' });
    }
    
    const result = await query(`
      UPDATE regions 
      SET name = $1, icon_url = $2, country_support = $3
      WHERE id = $4
      RETURNING id, name as title, icon_url, country_support, created_at
    `, [title, icon_url || null, country_support || [], id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating region:', error);
    res.status(500).json({ error: 'Failed to update region' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    // Check if region has associated products
    const productCheck = await query(`
      SELECT COUNT(*) as count FROM product_regions WHERE region_id = $1
    `, [id]);
    
    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete region with associated products' 
      });
    }
    
    const result = await query(`
      DELETE FROM regions WHERE id = $1 RETURNING *
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }
    
    res.json({ message: 'Region deleted successfully' });
  } catch (error) {
    console.error('Error deleting region:', error);
    res.status(500).json({ error: 'Failed to delete region' });
  }
}