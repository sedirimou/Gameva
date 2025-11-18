import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First get all categories with their basic structure
    const categoriesQuery = `
      WITH RECURSIVE category_tree AS (
        -- Get root categories
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
        0 as product_count
      FROM category_tree ct
      ORDER BY ct.level, ct.order_position, ct.name
    `;
    
    const result = await query(categoriesQuery);
    const categories = result.rows;
    
    // Calculate product counts including subcategories
    const categoriesWithCounts = await calculateProductCounts(categories);
    
    // Build tree structure
    const categoryTree = buildCategoryTree(categoriesWithCounts);
    
    res.status(200).json({ 
      success: true,
      categories: categoryTree || []
    });
  } catch (error) {
    console.error('Error fetching main menu categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      categories: []
    });
  }
}

// Calculate product counts including all subcategories
async function calculateProductCounts(categories) {
  const categoryMap = new Map();
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  // For each category, find all its descendants and count products
  for (const category of categories) {
    const descendants = getAllDescendants(category.id, categories);
    descendants.push(category.id); // Include the category itself
    
    // Count products in this category and all its descendants
    const productCountQuery = `
      SELECT COUNT(DISTINCT product_id) as count
      FROM product_categories 
      WHERE category_id = ANY($1::int[])
    `;
    
    try {
      const countResult = await query(productCountQuery, [descendants]);
      const totalCount = parseInt(countResult.rows[0]?.count || 0);
      categoryMap.get(category.id).product_count = totalCount;
    } catch (error) {
      console.error(`Error counting products for category ${category.id}:`, error);
      categoryMap.get(category.id).product_count = 0;
    }
  }

  return Array.from(categoryMap.values());
}

// Get all descendant category IDs for a given category
function getAllDescendants(categoryId, allCategories) {
  const descendants = [];
  const directChildren = allCategories.filter(cat => cat.parent_id === categoryId);
  
  for (const child of directChildren) {
    descendants.push(child.id);
    descendants.push(...getAllDescendants(child.id, allCategories));
  }
  
  return descendants;
}

// Helper function to build category tree structure
function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const rootCategories = [];

  // First pass: create all category objects
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: []
    });
  });

  // Second pass: build the tree structure
  categories.forEach(cat => {
    const categoryObj = categoryMap.get(cat.id);
    
    if (cat.parent_id === null) {
      rootCategories.push(categoryObj);
    } else {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(categoryObj);
      }
    }
  });

  return rootCategories;
}