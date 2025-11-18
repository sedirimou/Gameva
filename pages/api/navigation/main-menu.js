import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get main categories with their subcategories
    const mainMenuQuery = `
      SELECT 
        mmi.id, mmi.name, mmi.slug, mmi.category_id, mmi.parent_id,
        mmi.display_order, mmi.icon_url, mmi.description, mmi.is_active,
        mmi.show_product_count, mmi.category_image as main_menu_image,
        mmi.popular_product_ids,
        c.icon, c.banner, c.link, c.category_image, c.main_menu_display_type, c.main_menu_description,
        COALESCE(pc.product_count, 0) as product_count
      FROM main_menu_items mmi
      LEFT JOIN categories c ON mmi.category_id = c.id
      LEFT JOIN (
        SELECT 
          category_id,
          COUNT(*) as product_count
        FROM product_categories
        GROUP BY category_id
      ) pc ON mmi.category_id = pc.category_id
      WHERE mmi.is_active = true 
        AND mmi.category_id IS NOT NULL 
        AND c.parent_id IS NULL
      ORDER BY mmi.display_order, mmi.name
    `;

    // Get all subcategories for building the hierarchy
    const subcategoriesQuery = `
      SELECT 
        c.id, c.name, c.slug, c.parent_id, c.icon, c.banner, c.link,
        c.description, c.show_in_main_menu,
        COALESCE(pc.product_count, 0) as product_count
      FROM categories c
      LEFT JOIN (
        SELECT 
          category_id,
          COUNT(*) as product_count
        FROM product_categories
        GROUP BY category_id
      ) pc ON c.id = pc.category_id
      WHERE c.parent_id IS NOT NULL
        AND c.show_in_main_menu = true
      ORDER BY c.parent_id, c.order_position, c.name
    `;

    // Execute both queries
    const [mainCategoriesResult, subcategoriesResult] = await Promise.all([
      query(mainMenuQuery),
      query(subcategoriesQuery)
    ]);
    
    // Build hierarchical structure
    const mainCategories = mainCategoriesResult.rows.map(category => ({
      ...category,
      children: []
    }));

    // Add subcategories to their parent categories and calculate total product counts
    subcategoriesResult.rows.forEach(subcategory => {
      const parentCategory = mainCategories.find(cat => cat.category_id === subcategory.parent_id);
      if (parentCategory) {
        parentCategory.children.push(subcategory);
      }
    });

    // Calculate recursive product counts for main categories
    mainCategories.forEach(mainCategory => {
      // Start with the main category's direct product count
      let totalProductCount = parseInt(mainCategory.product_count) || 0;
      
      // Add product counts from all subcategories
      mainCategory.children.forEach(subcategory => {
        totalProductCount += parseInt(subcategory.product_count) || 0;
      });
      
      // Update the main category's product count with the recursive total
      mainCategory.product_count = totalProductCount.toString();
    });

    const menuTree = mainCategories;

    return res.status(200).json({
      success: true,
      categories: menuTree,
      totalItems: mainCategoriesResult.rows.length
    });

  } catch (error) {
    console.error('Main menu API error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch main menu items',
      details: error.message 
    });
  }
}