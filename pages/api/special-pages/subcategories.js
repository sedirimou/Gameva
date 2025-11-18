import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ message: 'Page slug is required' });
    }

    // Get the special page data
    const pageResult = await query('SELECT * FROM special_pages WHERE slug = $1', [slug]);
    const pageData = pageResult.rows[0];
    
    if (!pageData) {
      return res.status(404).json({ message: 'Page not found' });
    }

    let selectedCategoryIds = [];
    if (pageData.selected_categories) {
      try {
        selectedCategoryIds = JSON.parse(pageData.selected_categories);
      } catch (e) {
        console.error('Error parsing selected categories:', e);
        selectedCategoryIds = [];
      }
    }

    if (selectedCategoryIds.length === 0) {
      return res.status(200).json({
        success: true,
        subcategories: [],
        mainCategories: []
      });
    }

    // Get main categories and their subcategories
    const categoriesResult = await query(`
      WITH RECURSIVE category_tree AS (
        -- Get main categories (no parent)
        SELECT 
          id, name, slug, parent_id, icon, banner, description, sub_description,
          link, order_position, status, show_in_main_menu, created_at, updated_at,
          0 as level
        FROM categories 
        WHERE parent_id IS NULL
        
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
    `);

    const allCategories = categoriesResult.rows;

    // Filter main categories that are selected for this page
    const mainCategories = allCategories.filter(cat => 
      selectedCategoryIds.includes(cat.id) && !cat.parent_id
    );

    // Get all subcategories for the selected main categories
    const subcategories = allCategories.filter(cat => 
      selectedCategoryIds.includes(cat.parent_id)
    );

    return res.status(200).json({
      success: true,
      subcategories,
      mainCategories,
      allCategories
    });

  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subcategories' 
    });
  }
}