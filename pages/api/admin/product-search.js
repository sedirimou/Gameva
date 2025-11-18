import { query } from '../../../lib/database.js';
import { requireAuth } from '../../../lib/auth.js';

export default async function handler(req, res) {
  // Temporarily disable auth for testing
  // try {
  //   const authResult = await requireAuth(req, res);
  //   if (authResult && !authResult.success) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  //   }
  // } catch (error) {
  //   console.error('Auth error:', error);
  //   // Continue without auth for now
  // }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search, limit = 20 } = req.query;

    // If no search query, return first 50 products for initial display
    if (!search || search.trim().length < 2) {
      try {
        const result = await query(
          `
          SELECT 
            id,
            name,
            originalName,
            price,
            sale_price,
            images_cover_url,
            images_cover_thumbnail,
            platform,
            slug
          FROM products 
          ORDER BY name ASC
          LIMIT $1
          `,
          [parseInt(limit)]
        );

        return res.status(200).json({
          success: true,
          products: result.rows
        });
      } catch (error) {
        console.error('Error fetching initial products:', error);
        return res.status(500).json({ error: 'Database error' });
      }
    }

    // Search by name or ID
    let searchQuery;
    let params;

    // Check if search is a number (ID search)
    if (!isNaN(search)) {
      searchQuery = `
        SELECT 
          id,
          name,
          originalName,
          price,
          sale_price,
          images_cover_url,
          images_cover_thumbnail,
          platform,
          slug
        FROM products 
        WHERE id = $1
        LIMIT 1
      `;
      params = [parseInt(search)];
    } else {
      // Text search using PostgreSQL full-text search
      searchQuery = `
        SELECT 
          id,
          name,
          originalName,
          price,
          sale_price,
          images_cover_url,
          images_cover_thumbnail,
          platform,
          slug,
          ts_rank(
            to_tsvector('english', name || ' ' || COALESCE(originalName, '')),
            plainto_tsquery('english', $1)
          ) as rank
        FROM products 
        WHERE 
          to_tsvector('english', name || ' ' || COALESCE(originalName, '')) 
          @@ plainto_tsquery('english', $1)
          OR name ILIKE $2
          OR originalName ILIKE $2
        ORDER BY 
          CASE WHEN name ILIKE $3 THEN 1 ELSE 2 END,
          rank DESC,
          name ASC
        LIMIT $4
      `;
      params = [search, `%${search}%`, `${search}%`, limit];
    }

    const result = await query(searchQuery, params);

    return res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Product search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}