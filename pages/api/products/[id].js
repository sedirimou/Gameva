/**
 * Products API - Individual Product Operations
 * Handles GET, PUT, DELETE operations for specific products
 */
import { query } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate product ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      error: 'Invalid product ID. Must be a valid number.' 
    });
  }

  const productId = parseInt(id);

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res, productId);
    } else if (req.method === 'PUT') {
      return await handlePut(req, res, productId);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res, productId);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Products API error for ${req.method} ${id}:`, error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Contact administrator'
    });
  }
}

async function handleGet(req, res, productId) {
  try {
    const productQuery = `
      SELECT p.*, 
             c.name as category_name,
             c.slug as category_slug
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = $1
    `;

    const result = await query(productQuery, [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `Product with ID ${productId} does not exist`
      });
    }

    const product = result.rows[0];

    return res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
}

async function handlePut(req, res, productId) {
  try {
    // Check if user has permission (for production, uncomment auth check)
    // const user = await requireAuth(req, res, () => {});
    // if (!user || user.role !== 'admin') {
    //   return res.status(401).json({ error: 'Admin access required' });
    // }

    // First check if product exists
    const existsResult = await query('SELECT id FROM products WHERE id = $1', [productId]);
    
    if (existsResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `Cannot update product with ID ${productId} - product does not exist`
      });
    }

    const { name, description, price, category_id, status } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields. Name, description, and price are required.' 
      });
    }

    const updateQuery = `
      UPDATE products 
      SET name = $1, 
          description = $2, 
          price = $3,
          status = $4,
          updatedat = CURRENT_TIMESTAMP
      WHERE id = $5
    `;

    await query(updateQuery, [name, description, price, status || 'active', productId]);

    // Update category if provided
    if (category_id) {
      await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
      await query('INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)', [productId, category_id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
}

async function handleDelete(req, res, productId) {
  try {
    // Check if user has permission (for production, uncomment auth check)
    // const user = await requireAuth(req, res, () => {});
    // if (!user || user.role !== 'admin') {
    //   return res.status(401).json({ error: 'Admin access required' });
    // }

    // First check if product exists
    const existsResult = await query('SELECT id, name FROM products WHERE id = $1', [productId]);
    
    if (existsResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        message: `Product with ID ${productId} does not exist and cannot be deleted`
      });
    }

    const productName = existsResult.rows[0].name;

    // Begin transaction for safe deletion
    await query('BEGIN');

    try {
      // Remove from related tables first (cascade deletion)
      await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_platforms WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_developers WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_publishers WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_genres WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_languages WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_regions WHERE product_id = $1', [productId]);
      await query('DELETE FROM product_types WHERE product_id = $1', [productId]);
      await query('DELETE FROM shipping WHERE product_id = $1', [productId]);
      
      // Delete the main product record
      const result = await query('DELETE FROM products WHERE id = $1', [productId]);
      
      await query('COMMIT');

      return res.status(200).json({
        success: true,
        message: `Product "${productName}" (ID: ${productId}) deleted successfully`,
        deleted_product: {
          id: productId,
          name: productName
        }
      });

    } catch (deleteError) {
      await query('ROLLBACK');
      throw deleteError;
    }

  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
}