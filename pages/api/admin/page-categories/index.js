import { query } from '../../../../lib/database';
import { monitorAPIRoute } from '../../../../lib/apiMonitor';
import { requireAuth } from '../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;

  // Skip auth for GET requests in development
  if (method !== 'GET') {
    const authResult = await requireAuth(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: 'Authentication required' });
    }
  }

  if (method === 'GET') {
    try {
      const categories = await query(`
        SELECT 
          pc.*,
          COUNT(p.id) as page_count
        FROM page_categories pc
        LEFT JOIN pages p ON pc.id = p.page_category_id
        GROUP BY pc.id
        ORDER BY pc.sort_order ASC, pc.name ASC
      `);

      res.status(200).json({ categories: categories.rows });
    } catch (error) {
      console.error('Page categories API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (method === 'POST') {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    try {
      // Check if slug already exists
      const existingCategory = await query('SELECT id FROM page_categories WHERE slug = $1', [slug]);
      if (existingCategory.rows.length > 0) {
        return res.status(400).json({ error: 'A category with this slug already exists' });
      }

      const result = await query(`
        INSERT INTO page_categories (name, slug, description)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [name, slug, description || null]);

      res.status(201).json({ category: result.rows[0] });
    } catch (error) {
      console.error('Page categories API error:', error);
      if (error.code === '23505') {
        res.status(400).json({ error: 'A category with this slug already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default monitorAPIRoute(handler);