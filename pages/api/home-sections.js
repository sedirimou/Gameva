import { query } from '../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get visible home sections with their products in order
    const sectionsResult = await query(`
      SELECT 
        id,
        title,
        position,
        is_visible
      FROM home_sections 
      WHERE is_visible = true
      ORDER BY position ASC, id ASC
    `);

    const sections = [];
    
    for (const section of sectionsResult.rows) {
      // Get products for this section
      const productsResult = await query(`
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
      `, [section.id]);

      sections.push({
        ...section,
        products: productsResult.rows
      });
    }

    return res.status(200).json({
      success: true,
      sections
    });
  } catch (error) {
    console.error('Home sections API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}