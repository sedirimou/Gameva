import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          hc.*,
          COUNT(hf.id) as faq_count
        FROM help_categories hc
        LEFT JOIN help_faqs hf ON hc.id = hf.category_id AND hf.is_active = true
        WHERE hc.is_active = true
        GROUP BY hc.id
        ORDER BY hc.sort_order ASC, hc.name ASC
      `);

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching help categories:', error);
      res.status(500).json({ error: 'Failed to fetch help categories' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}