import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all filter options in parallel
    const [
      tagsResult,
      genresResult,
      languagesResult,
      developersResult,
      publishersResult,
      regionsResult,
      platformsResult,
      categoriesResult,
      typesResult
    ] = await Promise.all([
      query('SELECT id, name FROM tags ORDER BY name'),
      query('SELECT id, name FROM genres ORDER BY name'),
      query('SELECT id, name FROM languages ORDER BY name'),
      query('SELECT id, name FROM developers ORDER BY name'),
      query('SELECT id, name FROM publishers ORDER BY name'),
      query('SELECT id, name FROM regions ORDER BY name'),
      query('SELECT id, title FROM platforms ORDER BY title'),
      query(`
        SELECT 
          c.id, 
          c.name,
          COALESCE(pc.product_count, 0) as product_count
        FROM categories c
        LEFT JOIN (
          SELECT 
            category_id,
            COUNT(*) as product_count
          FROM product_categories
          GROUP BY category_id
        ) pc ON c.id = pc.category_id
        WHERE c.status = 'true' 
        ORDER BY c.name
      `),
      query(`
        SELECT 
          t.id, 
          t.name,
          COALESCE(pt.product_count, 0) as product_count
        FROM types t
        LEFT JOIN (
          SELECT 
            type_id,
            COUNT(*) as product_count
          FROM product_types
          GROUP BY type_id
        ) pt ON t.id = pt.type_id
        WHERE t.status = 'true' 
        ORDER BY t.order_position, t.name
      `)
    ]);

    res.status(200).json({
      success: true,
      data: {
        tags: tagsResult.rows,
        genres: genresResult.rows,
        languages: languagesResult.rows,
        developers: developersResult.rows,
        publishers: publishersResult.rows,
        regions: regionsResult.rows,
        platforms: platformsResult.rows,
        categories: categoriesResult.rows,
        types: typesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch filter options' 
    });
  }
}