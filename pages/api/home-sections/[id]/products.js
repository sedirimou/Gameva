import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get products for specific section
    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.originalName,
        p.price,
        p.sale_price,

        p.platform,
        p.genres,
        p.images_cover_url,
        p.images_cover_thumbnail,
        p.images_screenshots_url,
        p.slug,
        p.developers,
        p.publishers,
        p.releaseDate,
        p.ageRating,
        p.languages,
        p.qty,
        hsp.order_index
      FROM home_section_products hsp
      JOIN products p ON hsp.product_id = p.id
      WHERE hsp.section_id = $1
      ORDER BY hsp.order_index ASC, hsp.id ASC
      LIMIT 8
    `, [id]);

    return res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Section products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}