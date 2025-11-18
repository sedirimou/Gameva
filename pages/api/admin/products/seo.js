import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { productId } = req.query;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Fetch SEO data for the product from main products table
      const result = await query(
        'SELECT meta_title, meta_description, meta_keywords, og_title, og_description, og_image_url, slug FROM products WHERE id = $1',
        [productId]
      );

      if (result.rows.length > 0) {
        res.status(200).json({
          success: true,
          seo: result.rows[0]
        });
      } else {
        res.status(404).json({ error: 'SEO data not found for this product' });
      }

    } catch (error) {
      console.error('SEO fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch SEO data' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { productId, meta_title, meta_keywords, slug, meta_description, og_title, og_description, og_image_url } = req.body;

      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      // Update SEO data in the main products table
      const result = await query(
        `UPDATE products 
         SET meta_title = $1, meta_keywords = $2, slug = $3, meta_description = $4, 
             og_title = $5, og_description = $6, og_image_url = $7, updatedat = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING meta_title, meta_description, meta_keywords, og_title, og_description, og_image_url, slug`,
        [
          meta_title || '',
          meta_keywords || '',
          slug || '',
          meta_description || '',
          og_title || '',
          og_description || '',
          og_image_url || '',
          productId
        ]
      );

      if (result.rows.length > 0) {
        res.status(200).json({
          success: true,
          message: 'SEO data updated successfully',
          seo: result.rows[0]
        });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }

    } catch (error) {
      console.error('SEO update error:', error);
      res.status(500).json({ error: 'Failed to update SEO data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}