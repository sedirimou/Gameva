import { query } from '../../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug parameter is required' });
    }

    try {
      const result = await query(
        'SELECT * FROM special_pages WHERE slug = $1',
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Page not found' });
      }

      const pageData = result.rows[0];
      
      // Parse JSON fields
      if (pageData.selected_categories) {
        try {
          if (typeof pageData.selected_categories === 'string') {
            pageData.selected_categories = JSON.parse(pageData.selected_categories);
          }
        } catch (e) {
          pageData.selected_categories = [];
        }
      }
      
      if (pageData.icon_list) {
        try {
          if (typeof pageData.icon_list === 'string') {
            pageData.icon_list = JSON.parse(pageData.icon_list);
          }
        } catch (e) {
          pageData.icon_list = [];
        }
      }

      res.status(200).json(pageData);
    } catch (error) {
      console.error('Error fetching special page:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}