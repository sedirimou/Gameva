import { query } from '../../lib/database';
import { monitorAPIRoute } from '../../lib/apiMonitor';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Fetch all active pages grouped by category
    const result = await query(`
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.page_category_id,
        p.sort_order,
        pc.name as category_name,
        pc.slug as category_slug
      FROM pages p
      LEFT JOIN page_categories pc ON p.page_category_id = pc.id
      WHERE p.is_active = true
      AND pc.id IN (1, 2, 3, 13) -- Only footer categories
      ORDER BY pc.sort_order ASC, p.sort_order ASC
    `);

    // Group pages by category
    const pagesByCategory = {};
    result.rows.forEach(page => {
      if (!pagesByCategory[page.page_category_id]) {
        pagesByCategory[page.page_category_id] = [];
      }
      pagesByCategory[page.page_category_id].push({
        id: page.id,
        title: page.title,
        slug: page.slug,
        sort_order: page.sort_order
      });
    });

    res.status(200).json({
      success: true,
      pages: pagesByCategory
    });
  } catch (error) {
    console.error('Footer pages API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export default monitorAPIRoute(handler);