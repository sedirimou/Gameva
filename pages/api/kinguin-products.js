import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      platform = '', 
      genre = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (platform) {
      conditions.push(`platform ILIKE $${paramIndex}`);
      params.push(`%${platform}%`);
      paramIndex++;
    }

    if (genre) {
      conditions.push(`$${paramIndex} = ANY(genres)`);
      params.push(genre);
      paramIndex++;
    }

    if (minPrice) {
      conditions.push(`price >= $${paramIndex}`);
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`price <= $${paramIndex}`);
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortColumns = ['name', 'price', 'releaseDate', 'metacriticScore', 'updatedAt'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'name';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Get products with pagination
    const productsQuery = `
      SELECT 
        id, kinguinId, productId, name, originalName, description,
        developers, publishers, genres, platform, releaseDate,
        qty, price, isPreorder, metacriticScore, ageRating,
        images, tags, steam, updatedAt, images_cover_url, images_cover_thumbnail,
        images_screenshots_url, images_screenshots_thumbnail, activationDetails,
        regionalLimitations, countryLimitation
      FROM products 
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products 
      ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset for count query

    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, params),
      query(countQuery, countParams)
    ]);

    const products = productsResult.rows.map(product => ({
      ...product,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      price: parseFloat(product.price) || 0,
      source: 'kinguin'
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Kinguin products API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}