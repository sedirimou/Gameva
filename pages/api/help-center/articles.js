import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { categoryId, search, featured } = req.query;
      
      let sqlQuery = `
        SELECT 
          ha.*,
          hc.name as category_name,
          hc.slug as category_slug
        FROM help_articles ha
        LEFT JOIN help_categories hc ON ha.category_id = hc.id
        WHERE ha.is_active = true
      `;
      
      const params = [];
      
      if (categoryId) {
        params.push(categoryId);
        sqlQuery += ` AND ha.category_id = $${params.length}`;
      }
      
      if (search) {
        params.push(`%${search}%`);
        sqlQuery += ` AND (ha.title ILIKE $${params.length} OR ha.content ILIKE $${params.length - 1} OR ha.excerpt ILIKE $${params.length - 1})`;
      }
      
      if (featured === 'true') {
        sqlQuery += ` AND ha.is_featured = true`;
      }
      
      sqlQuery += ` ORDER BY ha.sort_order ASC, ha.id DESC`;
      
      const result = await query(sqlQuery, params);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}