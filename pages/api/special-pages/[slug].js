import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  const { method, query: { slug } } = req;

  if (!slug) {
    return res.status(400).json({ error: 'Page slug is required' });
  }

  try {
    switch (method) {
      case 'GET':
        const result = await query(`
          SELECT * FROM special_pages WHERE slug = $1
        `, [slug]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Special page not found' });
        }

        const page = result.rows[0];
        
        // Parse JSON fields
        if (page.icon_list) {
          try {
            page.icon_list = JSON.parse(page.icon_list);
          } catch (e) {
            page.icon_list = [];
          }
        }

        if (page.selected_categories) {
          try {
            page.selected_categories = JSON.parse(page.selected_categories);
          } catch (e) {
            page.selected_categories = [];
          }
        }

        return res.status(200).json({ page });

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Special page API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}