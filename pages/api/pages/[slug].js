import { query } from '../../../lib/database';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      `
        SELECT 
          p.id,
          p.title,
          p.slug,
          p.type,
          p.content_json,
          p.html_content,
          p.page_category_id,
          pc.name as category_name,
          pc.slug as category_slug,
          p.meta_title,
          p.meta_description,
          p.is_active,
          p.sort_order,
          p.created_at,
          p.updated_at
        FROM pages p
        LEFT JOIN page_categories pc ON p.page_category_id = pc.id
        WHERE p.slug = $1 AND p.is_active = true
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const page = result.rows[0];

    // Parse content_json if it's a string
    if (typeof page.content_json === 'string') {
      try {
        page.content_json = JSON.parse(page.content_json);
      } catch (e) {
        console.error('Error parsing content_json:', e);
        page.content_json = [];
      }
    }

    res.status(200).json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
}