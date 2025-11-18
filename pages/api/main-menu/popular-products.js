import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Get popular product IDs from main_menu_items table
    // First try by main_menu_items.id, then by category_id for subcategories
    let menuResult = await query(
      `SELECT popular_product_ids FROM main_menu_items WHERE id = $1`,
      [categoryId]
    );
    
    // If not found and categoryId looks like a category ID, try looking up by category_id
    if (menuResult.rows.length === 0) {
      menuResult = await query(
        `SELECT popular_product_ids FROM main_menu_items WHERE category_id = $1`,
        [categoryId]
      );
    }

    if (menuResult.rows.length === 0 || !menuResult.rows[0].popular_product_ids) {
      return res.status(200).json({ products: [] });
    }

    const productIds = menuResult.rows[0].popular_product_ids;

    if (productIds.length === 0) {
      return res.status(200).json({ products: [] });
    }

    // Fetch product details for the popular product IDs
    const placeholders = productIds.map((_, index) => `$${index + 1}`).join(', ');
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.images_cover_url,
        p.price,
        p.kinguinid,
        LOWER(REGEXP_REPLACE(p.name, '[^a-zA-Z0-9]+', '-', 'g')) as slug
      FROM products p
      WHERE p.id IN (${placeholders})
      ORDER BY 
        CASE p.id
          ${productIds.map((id, index) => `WHEN ${id} THEN ${index + 1}`).join(' ')}
        END
    `;

    const productsResult = await query(productsQuery, productIds);

    res.status(200).json({
      products: productsResult.rows
    });

  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({ error: 'Failed to fetch popular products' });
  }
}