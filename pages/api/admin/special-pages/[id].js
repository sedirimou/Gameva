import { query } from '../../../../lib/database';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM special_pages WHERE id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Special page not found' });
      }

      const page = result.rows[0];
      
      // Parse JSON fields
      if (page.icon_list && typeof page.icon_list === 'string') {
        try {
          page.icon_list = JSON.parse(page.icon_list);
        } catch (e) {
          page.icon_list = [];
        }
      }
      
      if (page.selected_categories && typeof page.selected_categories === 'string') {
        try {
          page.selected_categories = JSON.parse(page.selected_categories);
        } catch (e) {
          page.selected_categories = [];
        }
      }

      res.status(200).json({ page });
    } catch (error) {
      console.error('Error fetching special page:', error);
      res.status(500).json({ error: 'Failed to fetch special page' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}