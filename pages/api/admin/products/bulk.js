import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleBulkAction(req, res);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleBulkAction(req, res) {
  try {
    const { action, productIds, value } = req.body;

    if (!action || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const placeholders = productIds.map((_, index) => `$${index + 1}`).join(',');

    switch (action) {
      case 'remove':
        // First remove from related tables to avoid foreign key constraints
        for (const productId of productIds) {
          await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_platforms WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_developers WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_publishers WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_genres WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_languages WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_regions WHERE product_id = $1', [productId]);
          await query('DELETE FROM product_types WHERE product_id = $1', [productId]);
        }
        // Then remove from main table
        const result = await query(`DELETE FROM products WHERE id IN (${placeholders})`, productIds);
        console.log(`Bulk remove: deleted ${result.rowCount} products`);
        break;

      case 'changeCategory':
        if (!value) {
          return res.status(400).json({ error: 'Category value required' });
        }
        // Remove existing categories and add new one
        for (const productId of productIds) {
          await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
          await query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
            [productId, value]
          );
        }
        break;

      case 'changeType':
        if (!value) {
          return res.status(400).json({ error: 'Type value required' });
        }
        // Update type by adding to product_types table
        for (const productId of productIds) {
          await query('DELETE FROM product_types WHERE product_id = $1', [productId]);
          await query(
            'INSERT INTO product_types (product_id, type_id) VALUES ($1, $2)',
            [productId, value]
          );
        }
        break;

      case 'addToCategory':
        if (!value) {
          return res.status(400).json({ error: 'Category value required' });
        }
        // Add products to category using many-to-many relationship
        for (const productId of productIds) {
          await query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT (product_id, category_id) DO NOTHING',
            [productId, value]
          );
        }
        break;

      case 'addToSystem':
        if (!value) {
          return res.status(400).json({ error: 'System value required' });
        }
        // Systems are handled through product platforms
        for (const productId of productIds) {
          await query(
            'INSERT INTO product_platforms (product_id, platform_id) VALUES ($1, $2) ON CONFLICT (product_id, platform_id) DO NOTHING',
            [productId, value]
          );
        }
        break;

      case 'changeSystem':
        if (!value) {
          return res.status(400).json({ error: 'System value required' });
        }
        // Update systems through platforms table
        for (const productId of productIds) {
          // Remove existing platforms for this product
          await query('DELETE FROM product_platforms WHERE product_id = $1', [productId]);
          
          // Add new platform
          await query(
            'INSERT INTO product_platforms (product_id, platform_id) VALUES ($1, $2) ON CONFLICT (product_id, platform_id) DO NOTHING',
            [productId, value]
          );
        }
        break;

      case 'activate':
        await query(
          `UPDATE products 
           SET updatedat = NOW()
           WHERE id IN (${placeholders})`,
          productIds
        );
        break;

      case 'deactivate':
        await query(
          `UPDATE products 
           SET updatedat = NOW()
           WHERE id IN (${placeholders})`,
          productIds
        );
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({ 
      message: `Bulk ${action} completed successfully`,
      affected: productIds.length 
    });

  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}