import { query } from '../../../../lib/database.js';

// Function to sync popular products with main_menu_items table
async function syncPopularProductsToMainMenu(categoryId, productIds) {
  try {
    // Find the main menu item for this category
    const menuItemResult = await query(
      'SELECT id FROM main_menu_items WHERE category_id = $1',
      [categoryId]
    );

    if (menuItemResult.rows.length > 0) {
      const menuItemId = menuItemResult.rows[0].id;
      
      // Update the popular_product_ids array in main_menu_items
      await query(
        'UPDATE main_menu_items SET popular_product_ids = $1 WHERE id = $2',
        [productIds.length > 0 ? productIds : null, menuItemId]
      );
      
      console.log(`Synced popular products for main menu item ${menuItemId} with category ${categoryId}`);
    }
  } catch (error) {
    console.error('Error syncing popular products to main menu:', error);
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
  try {
    const { categoryId, search } = req.query;

    if (categoryId) {
      // Get popular products for specific category
      const popularProductsQuery = `
        SELECT 
          p.id,
          p.name,
          p.images_cover_url,
          p.price,
          p.productId as slug,
          cpp.display_order
        FROM category_popular_products cpp
        JOIN products p ON cpp.product_id = p.id
        WHERE cpp.category_id = $1
        ORDER BY cpp.display_order, p.name
      `;
      
      const result = await query(popularProductsQuery, [categoryId]);
      res.status(200).json({ products: result.rows });
    } else {
      // Search products for selection - optimized for speed
      let searchQuery = `
        SELECT 
          p.id,
          p.name,
          p.images_cover_url,
          p.price,
          p.platform
        FROM products p
      `;
      
      const conditions = [];
      const params = [];
      
      if (search && search.trim().length > 0) {
        conditions.push(`p.name ILIKE $1`);
        params.push(`%${search.trim()}%`);
      }
      
      if (conditions.length > 0) {
        searchQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      // Add index hint and limit for performance
      searchQuery += ` ORDER BY p.id LIMIT 30`;
      
      const result = await query(searchQuery, params);
      res.status(200).json({ products: result.rows });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function handlePost(req, res) {
  try {
    const { categoryId, productIds } = req.body;

    if (!categoryId || !Array.isArray(productIds)) {
      return res.status(400).json({ error: 'Category ID and product IDs array are required' });
    }

    // Delete existing popular products for this category
    await query('DELETE FROM category_popular_products WHERE category_id = $1', [categoryId]);
    
    // Insert new popular products assignments
    if (productIds.length > 0) {
      const popularProductsQuery = `
        INSERT INTO category_popular_products (category_id, product_id, display_order)
        VALUES ${productIds.map((_, index) => `($1, $${index + 2}, $${index + 2 + productIds.length})`).join(', ')}
      `;
      const popularProductsValues = [
        categoryId,
        ...productIds,
        ...productIds.map((_, index) => index + 1)
      ];
      await query(popularProductsQuery, popularProductsValues);
    }

    // Automatically sync with main_menu_items table
    await syncPopularProductsToMainMenu(categoryId, productIds);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating popular products:', error);
    res.status(500).json({ error: 'Failed to update popular products' });
  }
}