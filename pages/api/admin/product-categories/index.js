import { query } from '../../../../lib/database.js';

// Helper function to manage main menu integration
async function handleMainMenuIntegration(categoryId, slug, name, showInMainMenu, description = null) {
  try {
    if (showInMainMenu) {
      // Check if already exists in main_menu_items
      const existingCheck = await query(
        'SELECT id FROM main_menu_items WHERE category_id = $1',
        [categoryId]
      );

      if (existingCheck.rows.length === 0) {
        // Create new main menu item
        await query(`
          INSERT INTO main_menu_items (
            name, slug, category_id, display_order, is_active, 
            show_product_count, description, main_menu_display_type,
            banner_images, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [
          name,
          slug,
          categoryId,
          1, // default display order
          true,
          true,
          description || `Browse ${name} products`,
          'products', // default to products display
          JSON.stringify(['', '', '', '']) // empty banner slots
        ]);
        console.log(`Created main menu item for category: ${name}`);
      } else {
        // Update existing main menu item
        await query(`
          UPDATE main_menu_items 
          SET name = $1, slug = $2, description = $3, is_active = true, updated_at = CURRENT_TIMESTAMP
          WHERE category_id = $4
        `, [name, slug, description || `Browse ${name} products`, categoryId]);
        console.log(`Updated main menu item for category: ${name}`);
      }
    } else {
      // Remove from main menu by setting inactive
      await query(
        'UPDATE main_menu_items SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE category_id = $1',
        [categoryId]
      );
      console.log(`Deactivated main menu item for category: ${name}`);
    }
  } catch (error) {
    console.error('Error managing main menu integration:', error);
    // Don't throw error to avoid breaking category creation/update
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    const { hierarchical = 'true', parent_id } = req.query;
    
    // Handle specific parent_id request (for subcategory fetching)
    if (parent_id) {
      const subcategoriesQuery = `
        SELECT 
          c.*,
          COALESCE(pc.product_count, 0) as product_count
        FROM categories c
        LEFT JOIN (
          SELECT 
            category_id,
            COUNT(*) as product_count
          FROM product_categories
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        WHERE c.parent_id = $1
        ORDER BY c.order_position, c.name
      `;
      
      const result = await query(subcategoriesQuery, [parent_id]);
      return res.status(200).json({ categories: result.rows });
    }
    
    if (hierarchical === 'true') {
      // Get hierarchical categories (parent-child structure) with accurate product counts
      const categoriesQuery = `
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
      `;
      
      const result = await query(categoriesQuery);
      const categories = buildCategoryTree(result.rows);
      
      res.status(200).json({ categories });
    } else {
      // Get flat list of categories with accurate product counts
      const categoriesQuery = `
        SELECT 
          c.*,
          COALESCE(pc.product_count, 0) as product_count
        FROM categories c
        LEFT JOIN (
          SELECT 
            category_id,
            COUNT(*) as product_count
          FROM product_categories
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        ORDER BY c.order_position, c.name
      `;
      
      const result = await query(categoriesQuery);
      res.status(200).json({ categories: result.rows });
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

async function handlePost(req, res) {
  try {
    const {
      name,
      slug,
      parent_id,
      icon,
      banner,
      description,
      sub_description,
      link,
      order_position = 0,
      status = true,
      show_in_main_menu = false,
      category_image,
      main_menu_display_type = 'products',
      main_menu_description,
      popular_products = []
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const insertQuery = `
      INSERT INTO categories (
        name, slug, parent_id, icon, banner, description, sub_description,
        link, order_position, status, show_in_main_menu, category_image, 
        main_menu_display_type, main_menu_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      name, slug, parent_id || null, icon, banner, description, sub_description,
      link, order_position, status, show_in_main_menu, category_image, 
      main_menu_display_type, main_menu_description
    ];

    const result = await query(insertQuery, values);
    const categoryId = result.rows[0].id;

    // Handle popular products assignments
    if (popular_products && popular_products.length > 0) {
      const popularProductsQuery = `
        INSERT INTO category_popular_products (category_id, product_id, display_order)
        VALUES ${popular_products.map((_, index) => `($1, $${index + 2}, $${index + 2 + popular_products.length})`).join(', ')}
      `;
      const popularProductsValues = [
        categoryId,
        ...popular_products,
        ...popular_products.map((_, index) => index + 1)
      ];
      await query(popularProductsQuery, popularProductsValues);
    }

    // Automatic main menu integration
    if (show_in_main_menu) {
      await handleMainMenuIntegration(categoryId, slug, name, true, main_menu_description);
    }

    res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Category slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const {
      name,
      slug,
      parent_id,
      icon,
      banner,
      description,
      sub_description,
      link,
      order_position,
      status,
      show_in_main_menu,
      category_image,
      main_menu_display_type,
      main_menu_description,
      popular_products = []
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const updateQuery = `
      UPDATE categories SET
        name = COALESCE($2, name),
        slug = COALESCE($3, slug),
        parent_id = $4,
        icon = $5,
        banner = $6,
        description = $7,
        sub_description = $8,
        link = $9,
        order_position = COALESCE($10, order_position),
        status = COALESCE($11, status),
        show_in_main_menu = COALESCE($12, show_in_main_menu),
        category_image = $13,
        main_menu_display_type = COALESCE($14, main_menu_display_type),
        main_menu_description = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id, name, slug, parent_id || null, icon, banner, description, sub_description,
      link, order_position, status, show_in_main_menu, category_image, main_menu_display_type, 
      main_menu_description
    ];

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update popular products assignments
    if (popular_products !== undefined) {
      // Delete existing popular products for this category
      await query('DELETE FROM category_popular_products WHERE category_id = $1', [id]);
      
      // Insert new popular products assignments
      if (popular_products.length > 0) {
        const popularProductsQuery = `
          INSERT INTO category_popular_products (category_id, product_id, display_order)
          VALUES ${popular_products.map((_, index) => `($1, $${index + 2}, $${index + 2 + popular_products.length})`).join(', ')}
        `;
        const popularProductsValues = [
          id,
          ...popular_products,
          ...popular_products.map((_, index) => index + 1)
        ];
        await query(popularProductsQuery, popularProductsValues);
      }
    }

    // Automatic main menu integration
    if (show_in_main_menu !== undefined) {
      await handleMainMenuIntegration(id, slug || result.rows[0].slug, name || result.rows[0].name, show_in_main_menu, main_menu_description);
    }

    res.status(200).json({ category: result.rows[0] });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Category slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Check if category has sub-categories
    const checkSubCategoriesQuery = `
      SELECT COUNT(*) as count FROM categories WHERE parent_id = $1
    `;
    
    const subCategoriesResult = await query(checkSubCategoriesQuery, [id]);
    const hasSubCategories = parseInt(subCategoriesResult.rows[0].count) > 0;

    if (hasSubCategories) {
      return res.status(400).json({ 
        error: 'Cannot delete category with sub-categories. Delete sub-categories first.' 
      });
    }

    const deleteQuery = `DELETE FROM categories WHERE id = $1 RETURNING *`;
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

// Helper function to build hierarchical category tree
function buildCategoryTree(categories) {
  const categoryMap = new Map();
  const tree = [];

  // First pass: create category objects with children arrays
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: []
    });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    if (category.parent_id === null) {
      // Root category
      tree.push(categoryMap.get(category.id));
    } else {
      // Child category
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(categoryMap.get(category.id));
      }
    }
  });

  return tree;
}