import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { page = 1, limit = 20, microsoftCategory } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // First, get the Microsoft special page data to get selected categories
    const pageResult = await query('SELECT * FROM special_pages WHERE id = $1', [1]);
    const pageData = pageResult.rows[0];
    
    let categoryIds = [];
    if (pageData && pageData.selected_categories) {
      try {
        categoryIds = JSON.parse(pageData.selected_categories);
      } catch (e) {
        console.error('Error parsing selected categories:', e);
      }
    }

    // Build query based on filter selection
    let whereClause = '';
    let queryParams = [];
    let paramIndex = 1;

    if (microsoftCategory && microsoftCategory !== '') {
      // Handle specific category or subcategory filtering
      if (microsoftCategory.startsWith('cat-')) {
        const categoryId = microsoftCategory.replace('cat-', '');
        whereClause = `WHERE p.id IN (
          SELECT DISTINCT pc.product_id 
          FROM product_categories pc 
          WHERE pc.category_id = $${paramIndex}
        )`;
        queryParams.push(parseInt(categoryId));
        paramIndex++;
      } else if (microsoftCategory.startsWith('sub-')) {
        const subcategoryId = microsoftCategory.replace('sub-', '');
        whereClause = `WHERE p.id IN (
          SELECT DISTINCT pc.product_id 
          FROM product_categories pc 
          WHERE pc.category_id = $${paramIndex}
        )`;
        queryParams.push(parseInt(subcategoryId));
        paramIndex++;
      }
    } else {
      // Default: show all products from selected Microsoft categories
      if (categoryIds.length > 0) {
        whereClause = `WHERE p.id IN (
          SELECT DISTINCT pc.product_id 
          FROM product_categories pc 
          WHERE pc.category_id = ANY($${paramIndex})
        )`;
        queryParams.push(categoryIds);
        paramIndex++;
      } else {
        // If no categories selected, show no products
        whereClause = `WHERE 1=0`;
      }
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0]?.total || 0);

    // Get products
    const productsQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.originalName, 
        p.description, 
        p.platform, 
        p.kinguin_price, 
        p.price, 
        p.final_price,
        p.developers, 
        p.publishers, 
        p.genres, 
        p.releaseDate, 
        p.ageRating, 
        p.languages, 
        p.qty,
        p.images_cover_url, 
        p.images_cover_thumbnail, 
        p.images_screenshots_url, 
        p.slug,
        p.updatedAt
      FROM products p
      ${whereClause}
      ORDER BY p.updatedAt DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const productsResult = await query(productsQuery, [...queryParams, parseInt(limit), offset]);
    const products = productsResult.rows || [];

    const hasMore = total > offset + products.length;

    res.status(200).json({
      success: true,
      products,
      total,
      hasMore,
      page: parseInt(page),
      limit: parseInt(limit),
      pageData: pageData || null
    });

  } catch (error) {
    console.error('Error fetching Microsoft products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching products',
      error: error.message 
    });
  }
}