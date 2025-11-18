import { query } from '../../../../lib/database';
import { monitorAPIRoute } from '../../../../lib/apiMonitor';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
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
        WHERE p.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Page not found' 
        });
      }

      const page = result.rows[0];

      // Parse content_json if it exists and is a string
      if (page.content_json && typeof page.content_json === 'string') {
        try {
          page.content_json = JSON.parse(page.content_json);
        } catch (e) {
          console.error('Failed to parse content_json:', e);
          page.content_json = [];
        }
      } else if (!Array.isArray(page.content_json)) {
        page.content_json = [];
      }

      return res.status(200).json({
        success: true,
        page
      });

    } catch (error) {
      console.error('Error fetching page:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        title,
        slug,
        meta_title,
        meta_description,
        page_category_id,
        is_active,
        sort_order,
        type,
        content_json
      } = req.body;

      // Debug logging
      console.log('Validation check:', {
        title: title,
        slug: slug,
        page_category_id: page_category_id,
        page_category_id_parsed: parseInt(page_category_id),
        isNaN: isNaN(parseInt(page_category_id))
      });

      // Validate required fields
      if (!title || !slug || !page_category_id || isNaN(parseInt(page_category_id))) {
        console.log('Validation failed - returning 400');
        return res.status(400).json({
          success: false,
          message: 'Title, slug, and a valid category are required',
          debug: {
            title: !!title,
            slug: !!slug,
            page_category_id: !!page_category_id,
            page_category_id_value: page_category_id,
            isNaN: isNaN(parseInt(page_category_id))
          }
        });
      }

      // Check if slug is unique (excluding current page)
      const slugCheck = await query(
        'SELECT id FROM pages WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (slugCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }

      const result = await query(
        `
        UPDATE pages 
        SET 
          title = $1,
          slug = $2,
          meta_title = $3,
          meta_description = $4,
          page_category_id = $5,
          is_active = $6,
          sort_order = $7,
          type = $8,
          content_json = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
        `,
        [
          title,
          slug,
          meta_title || `${title} - Gamava`,
          meta_description || '',
          parseInt(page_category_id),
          is_active !== false,
          parseInt(sort_order) || 1,
          type || 'static',
          JSON.stringify(content_json || []),
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Page updated successfully',
        page: result.rows[0]
      });

    } catch (error) {
      console.error('Error updating page:', error);
      console.error('Request body:', req.body);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await query(
        'DELETE FROM pages WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Page deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting page:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default monitorAPIRoute(handler);