import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      `
        SELECT slug, title, updated_at
        FROM pages 
        WHERE is_active = true
        ORDER BY updated_at DESC
      `
    );

    const pages = result.rows.map(page => ({
      slug: page.slug,
      title: page.title,
      lastModified: page.updated_at
    }));

    res.status(200).json({ pages });
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    res.status(500).json({ error: 'Failed to fetch sitemap' });
  }
}