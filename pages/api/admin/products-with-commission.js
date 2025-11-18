import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      limit = 25,
      offset = 0,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      search = '',
      platform = '',
      category = '',
      region = '',
      type = '',
      system = '',
      priceMin = '',
      priceMax = ''
    } = req.query;

    // Build WHERE conditions
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Search filter - optimized full-text search
    if (search) {
      // Use full-text search for better performance on multi-word queries
      const searchTerms = search.trim().split(/\s+/).join(' & ');
      conditions.push(`(to_tsvector('english', p.name) @@ to_tsquery('english', $${paramIndex}) OR p.name ILIKE $${paramIndex + 1})`);
      params.push(searchTerms);
      params.push(`%${search}%`);
      paramIndex += 2;
    }

    // Platform filter
    if (platform) {
      conditions.push(`p.platform ILIKE $${paramIndex}`);
      params.push(`%${platform}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      conditions.push(`EXISTS (SELECT 1 FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = p.id AND c.name ILIKE $${paramIndex})`);
      params.push(`%${category}%`);
      paramIndex++;
    }

    // Region filter
    if (region) {
      conditions.push(`p.regionalLimitations ILIKE $${paramIndex}`);
      params.push(`%${region}%`);
      paramIndex++;
    }

    // Type filter  
    if (type) {
      conditions.push(`EXISTS (SELECT 1 FROM product_types pt JOIN types t ON pt.type_id = t.id WHERE pt.product_id = p.id AND t.name ILIKE $${paramIndex})`);
      params.push(`%${type}%`);
      paramIndex++;
    }

    // Price range filter
    if (priceMin) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(parseFloat(priceMin));
      paramIndex++;
    }
    if (priceMax) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(parseFloat(priceMax));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column
    const validSortColumns = ['name', 'price', 'updatedat'];
    let sortColumn = 'updatedat'; // Default
    if (sortBy === 'name') sortColumn = 'name';
    else if (sortBy === 'price') sortColumn = 'price';
    else if (sortBy === 'updated_at' || sortBy === 'updatedAt') sortColumn = 'updatedat';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN kinguin_commission_tiers t ON p.commission_tier_id = t.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get products with commission-based pricing
    const productsQuery = `
      SELECT DISTINCT
        p.id, 
        p.name, 
        p.price, 
        p.kinguin_price,
        p.slug,
        p.regionalLimitations as region, 
        p.updatedat as created_at, 
        p.updatedat as updated_at, 
        p.platform,
        p.commission_tier_id,
        t.type as commission_type,
        t.rate as commission_rate,
        0 as commission_amount,
        COALESCE(
          (SELECT c.name FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = p.id LIMIT 1),
          'Uncategorized'
        ) as category,
        COALESCE(
          (SELECT ty.name FROM product_types pt JOIN types ty ON pt.type_id = ty.id WHERE pt.product_id = p.id LIMIT 1),
          ''
        ) as type,
        p.images_cover_url,
        p.images_cover_thumbnail,
        p.images_screenshots_url,
        p.images_screenshots_thumbnail,
        COALESCE(array_to_string(p.developers, ','), '') as developers,
        COALESCE(array_to_string(p.publishers, ','), '') as publishers,
        COALESCE(array_to_string(p.genres, ','), 'Gaming') as genres,
        COALESCE(p.systemrequirements::text, '{}') as systems,
        'kinguin' as source,
        true as status
      FROM products p
      LEFT JOIN kinguin_commission_tiers t ON p.commission_tier_id = t.id
      ${whereClause}
      ORDER BY p.${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const productsParams = [...params, parseInt(limit), parseInt(offset)];
    const productsResult = await query(productsQuery, productsParams);

    // Process results to ensure proper data types
    const products = productsResult.rows.map(product => ({
      ...product,
      price: parseFloat(product.price),
      commission_amount: parseFloat(product.commission_amount || 0),
      imageUrl: product.images_cover_url || '/placeholder-game.svg',
      thumbnailUrl: product.images_cover_thumbnail || product.images_cover_url || '/placeholder-game.svg'
    }));

    res.status(200).json({
      products,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching products with commission:', error);
    res.status(500).json({ 
      message: 'Error fetching products', 
      error: error.message 
    });
  }
}