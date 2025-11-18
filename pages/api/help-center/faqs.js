import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { categoryId, search, featured } = req.query;
      
      let sqlQuery = `
        SELECT 
          hf.*,
          hc.name as category_name,
          hc.slug as category_slug
        FROM help_faqs hf
        LEFT JOIN help_categories hc ON hf.category_id = hc.id
        WHERE hf.is_active = true
      `;
      
      const params = [];
      
      if (categoryId) {
        params.push(categoryId);
        sqlQuery += ` AND hf.category_id = $${params.length}`;
      }
      
      if (search) {
        params.push(`%${search}%`);
        sqlQuery += ` AND (hf.question ILIKE $${params.length} OR hf.answer ILIKE $${params.length})`;
      }
      
      if (featured === 'true') {
        sqlQuery += ` AND hf.is_featured = true`;
      }
      
      sqlQuery += ` ORDER BY hf.sort_order ASC, hf.id ASC`;
      
      const result = await query(sqlQuery, params);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}