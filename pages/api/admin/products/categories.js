import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'GET') {
    return handleGet(req, res);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

async function handlePost(req, res) {
  try {
    const { productId, categoryIds } = req.body;

    if (!productId || !Array.isArray(categoryIds)) {
      return res.status(400).json({ error: 'Product ID and category IDs array are required' });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Remove existing category assignments for this product
      await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);

      // Insert new category assignments
      if (categoryIds.length > 0) {
        const insertPromises = categoryIds.map(categoryId => 
          query('INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)', [productId, categoryId])
        );
        await Promise.all(insertPromises);
      }

      // Commit transaction
      await query('COMMIT');

      res.status(200).json({ 
        message: `Updated category assignments for product ${productId}`,
        productId,
        categoryIds
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating product categories:', error);
    res.status(500).json({ error: 'Failed to update product categories' });
  }
}

async function handleGet(req, res) {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Get current category assignments for the product
    const result = await query(`
      SELECT pc.category_id, c.name as category_name
      FROM product_categories pc
      JOIN categories c ON pc.category_id = c.id
      WHERE pc.product_id = $1
      ORDER BY c.name
    `, [productId]);

    res.status(200).json({ 
      productId,
      categories: result.rows
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    res.status(500).json({ error: 'Failed to fetch product categories' });
  }
}