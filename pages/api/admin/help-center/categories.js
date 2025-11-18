import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          hc.*,
          COUNT(hf.id) as faq_count,
          COUNT(ha.id) as article_count
        FROM help_categories hc
        LEFT JOIN help_faqs hf ON hc.id = hf.category_id AND hf.is_active = true
        LEFT JOIN help_articles ha ON hc.id = ha.category_id AND ha.is_active = true
        GROUP BY hc.id
        ORDER BY hc.sort_order ASC, hc.name ASC
      `);

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching help categories:', error);
      res.status(500).json({ error: 'Failed to fetch help categories' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, slug, description, icon, sort_order = 0 } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }

      const result = await query(`
        INSERT INTO help_categories (name, slug, description, icon, sort_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING *
      `, [name, slug, description, icon, sort_order]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating help category:', error);
      res.status(500).json({ error: 'Failed to create help category' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}