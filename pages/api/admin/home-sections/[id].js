import { query } from '../../../../lib/database.js';
import { requireAuth } from '../../../../lib/auth.js';

export default async function handler(req, res) {
  // Temporarily disable auth for testing
  // try {
  //   const authResult = await requireAuth(req, res);
  //   if (authResult && !authResult.success) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  //   }
  // } catch (error) {
  //   console.error('Auth error:', error);
  //   // Continue without auth for now
  // }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Section ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get section with its products
      const sectionResult = await query(`
        SELECT * FROM home_sections WHERE id = $1
      `, [id]);

      if (sectionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Section not found' });
      }

      const productsResult = await query(`
        SELECT 
          hsp.*,
          p.name,
          p.price,
          p.sale_price,
          p.images_cover_url,
          p.images_cover_thumbnail,
          p.platform,
          p.slug
        FROM home_section_products hsp
        JOIN products p ON hsp.product_id = p.id
        WHERE hsp.section_id = $1
        ORDER BY hsp.order_index ASC, hsp.id ASC
      `, [id]);

      return res.status(200).json({
        success: true,
        section: sectionResult.rows[0],
        products: productsResult.rows
      });
    }

    if (req.method === 'PUT') {
      const { title, is_visible } = req.body;

      const result = await query(`
        UPDATE home_sections 
        SET title = $1, is_visible = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `, [title, is_visible, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Section not found' });
      }

      return res.status(200).json({
        success: true,
        section: result.rows[0]
      });
    }

    if (req.method === 'DELETE') {
      // Delete section and its products (CASCADE will handle products)
      const result = await query(`
        DELETE FROM home_sections WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Section not found' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Home section API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}