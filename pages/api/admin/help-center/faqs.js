import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { categoryId, search } = req.query;
      
      let sqlQuery = `
        SELECT 
          hf.*,
          hc.name as category_name,
          hc.slug as category_slug
        FROM help_faqs hf
        LEFT JOIN help_categories hc ON hf.category_id = hc.id
        WHERE 1=1
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
      
      sqlQuery += ` ORDER BY hf.sort_order ASC, hf.id ASC`;
      
      const result = await query(sqlQuery, params);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { category_id, question, answer, sort_order = 0 } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      const result = await query(`
        INSERT INTO help_faqs (category_id, question, answer, sort_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, true, NOW(), NOW())
        RETURNING *
      `, [category_id || null, question, answer, sort_order]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating FAQ:', error);
      res.status(500).json({ error: 'Failed to create FAQ' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}