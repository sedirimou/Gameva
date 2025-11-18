import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get Kinguin products statistics
    const [
      totalResult,
      platformResult,
      genreResult,
      priceResult,
      recentResult
    ] = await Promise.all([
      // Total products count
      query('SELECT COUNT(*) as total FROM products'),
      
      // Products by platform
      query(`
        SELECT platform, COUNT(*) as count 
        FROM products 
        WHERE platform IS NOT NULL AND platform != '' 
        GROUP BY platform 
        ORDER BY count DESC 
        LIMIT 10
      `),
      
      // Most popular genres
      query(`
        SELECT genre, COUNT(*) as count
        FROM products, unnest(genres) as genre
        WHERE genres IS NOT NULL
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 10
      `),
      
      // Price statistics
      query(`
        SELECT 
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          COUNT(CASE WHEN price > 0 THEN 1 END) as products_with_price
        FROM products
      `),
      
      // Recently imported products
      query(`
        SELECT COUNT(*) as count
        FROM products 
        WHERE updatedAt >= (NOW() - INTERVAL '24 hours')::TEXT
      `)
    ]);

    const stats = {
      total: parseInt(totalResult.rows[0].total),
      platforms: platformResult.rows,
      genres: genreResult.rows,
      pricing: {
        averagePrice: parseFloat(priceResult.rows[0].avg_price) || 0,
        minPrice: parseFloat(priceResult.rows[0].min_price) || 0,
        maxPrice: parseFloat(priceResult.rows[0].max_price) || 0,
        productsWithPrice: parseInt(priceResult.rows[0].products_with_price) || 0
      },
      recentImports: parseInt(recentResult.rows[0].count),
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Kinguin stats API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}