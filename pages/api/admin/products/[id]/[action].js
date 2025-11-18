import { query } from '../../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleProductAction(req, res);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleProductAction(req, res) {
  try {
    const { id, action } = req.query;
    const productId = parseInt(id);

    if (!productId || !action) {
      return res.status(400).json({ error: 'Invalid product ID or action' });
    }

    switch (action) {
      case 'refresh':
        // Refresh stock and price from Kinguin API
        await refreshFromKinguin(productId);
        break;

      case 'remove':
        // First remove from related tables to avoid foreign key constraints
        await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_platforms WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_developers WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_publishers WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_genres WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_languages WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_regions WHERE product_id = $1', [productId]);
        await query('DELETE FROM product_types WHERE product_id = $1', [productId]);
        // Then remove from main table
        await query('DELETE FROM products WHERE id = $1', [productId]);
        break;

      case 'activate':
        await query(
          'UPDATE products SET updatedat = NOW() WHERE id = $1',
          [productId]
        );
        break;

      case 'deactivate':
        await query(
          'UPDATE products SET updatedat = NOW() WHERE id = $1',
          [productId]
        );
        break;

      default:
        // Handle dynamic actions like changeType/value
        if (action.startsWith('changeType/')) {
          const newType = action.split('/')[1];
          // Update product type through product_types table
          await query('DELETE FROM product_types WHERE product_id = $1', [productId]);
          await query(
            'INSERT INTO product_types (product_id, type_id) VALUES ($1, $2)',
            [productId, newType]
          );
        } else if (action.startsWith('changeCategory/')) {
          const newCategory = action.split('/')[1];
          // Update product category through product_categories table
          await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
          await query(
            'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)',
            [productId, newCategory]
          );
        } else {
          return res.status(400).json({ error: 'Invalid action' });
        }
    }

    res.status(200).json({ 
      message: `Product ${action} completed successfully`,
      productId 
    });

  } catch (error) {
    console.error('Product action error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function refreshFromKinguin(productId) {
  try {
    // Get current product to find Kinguin ID
    const productResult = await query(
      'SELECT kinguinid FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const kinguinId = productResult.rows[0].kinguinid;
    if (!kinguinId) {
      throw new Error('No Kinguin ID found for this product');
    }

    // Get Kinguin settings
    const settingsResult = await query(
      'SELECT api_key FROM kinguin_settings WHERE id = 1'
    );

    if (settingsResult.rows.length === 0) {
      throw new Error('Kinguin API settings not configured');
    }

    const apiKey = settingsResult.rows[0].api_key;

    // Fetch fresh data from Kinguin API
    const response = await fetch(`https://gateway.kinguin.net/esa/api/v1/products/${kinguinId}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Kinguin API error: ${response.status}`);
    }

    const kinguinProduct = await response.json();

    // Update product with fresh data
    await query(
      `UPDATE products 
       SET 
         price = $1,
         qty = $2,
         updatedat = NOW()
       WHERE id = $3`,
      [
        kinguinProduct.price?.amount || 0,
        kinguinProduct.qty || 0,
        productId
      ]
    );

  } catch (error) {
    console.error('Kinguin refresh error:', error);
    // Update last refresh attempt even if failed
    await query(
      'UPDATE products SET updatedat = NOW() WHERE id = $1',
      [productId]
    );
    throw error;
  }
}