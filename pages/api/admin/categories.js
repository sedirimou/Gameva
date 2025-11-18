import { query } from '../../../lib/database';
import { monitorAPIRoute } from '../../../lib/apiMonitor';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { hierarchical } = req.query;

    let categoryQuery;
    if (hierarchical === 'true') {
      // Return hierarchical categories for admin interface
      categoryQuery = `
        SELECT 
          c.id, 
          c.name,
          c.slug,
          c.description,
          c.parent_id,
          c.sort_order,
          c.is_active,
          c.created_at,
          c.updated_at,
          COALESCE(pc.product_count, 0) as product_count
        FROM categories c
        LEFT JOIN (
          SELECT 
            category_id,
            COUNT(*) as product_count
          FROM product_categories
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        WHERE c.status = 'true' 
        ORDER BY c.parent_id NULLS FIRST, c.sort_order, c.name
      `;
    } else {
      // Return flat categories list
      categoryQuery = `
        SELECT 
          c.id, 
          c.name,
          c.slug,
          c.description,
          c.parent_id,
          c.sort_order,
          c.is_active,
          c.created_at,
          c.updated_at,
          COALESCE(pc.product_count, 0) as product_count
        FROM categories c
        LEFT JOIN (
          SELECT 
            category_id,
            COUNT(*) as product_count
          FROM product_categories
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        WHERE c.status = 'true' 
        ORDER BY c.name
      `;
    }

    const result = await query(categoryQuery);

    return res.status(200).json({
      success: true,
      categories: result.rows
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      categories: []
    });
  }
}

export default monitorAPIRoute(handler);