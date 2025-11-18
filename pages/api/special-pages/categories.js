import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { pageId } = req.query;

    // Get the special page data to get selected categories
    const pageResult = await query('SELECT * FROM special_pages WHERE id = $1', [pageId]);
    const pageData = pageResult.rows[0];
    
    if (!pageData) {
      return res.status(404).json({ message: 'Page not found' });
    }

    let categoryIds = [];
    if (pageData.selected_categories) {
      try {
        categoryIds = JSON.parse(pageData.selected_categories);
      } catch (e) {
        console.error('Error parsing selected categories:', e);
      }
    }

    if (categoryIds.length === 0) {
      return res.status(200).json({
        success: true,
        categories: [],
        subcategories: []
      });
    }

    // Get main categories and their subcategories
    const categoriesQuery = `
      WITH RECURSIVE category_tree AS (
        -- Get selected main categories
        SELECT 
          id, name, slug, parent_id, icon, banner, description, sub_description,
          link, order_position, status, show_in_main_menu, created_at, updated_at,
          0 as level
        FROM categories 
        WHERE id = ANY($1) AND parent_id IS NULL
        
        UNION ALL
        
        -- Get sub-categories recursively
        SELECT 
          c.id, c.name, c.slug, c.parent_id, c.icon, c.banner, c.description, c.sub_description,
          c.link, c.order_position, c.status, c.show_in_main_menu, c.created_at, c.updated_at,
          ct.level + 1
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT 
        ct.*,
        COALESCE(pc.product_count, 0) as product_count
      FROM category_tree ct
      LEFT JOIN (
        SELECT 
          category_id,
          COUNT(*) as product_count
        FROM product_categories
        GROUP BY category_id
      ) pc ON ct.id = pc.category_id
      ORDER BY ct.level, ct.order_position, ct.name
    `;

    const categoriesResult = await query(categoriesQuery, [categoryIds]);
    const allCategories = categoriesResult.rows || [];

    // Separate main categories and subcategories
    const mainCategories = allCategories.filter(cat => cat.level === 0);
    const subcategories = allCategories.filter(cat => cat.level > 0);

    res.status(200).json({
      success: true,
      categories: mainCategories,
      subcategories: subcategories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories',
      error: error.message 
    });
  }
}