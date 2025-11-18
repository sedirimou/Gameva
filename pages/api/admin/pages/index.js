import { query } from '../../../../lib/database';
import { monitorAPIRoute } from '../../../../lib/apiMonitor';
import { requireAuth } from '../../../../lib/auth';

async function handler(req, res) {
  const { method } = req;

  // Skip auth in development for LeeCMS functionality
  // TODO: Re-enable authentication in production
  if (false && method !== 'GET') {
    try {
      const authResult = await requireAuth(req, res);
      if (!authResult || !authResult.success) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }

  try {
    switch (method) {
      case 'GET':
        // Get all pages with categories
        const result = await query(`
          SELECT 
            p.id,
            p.title,
            p.slug,
            p.type,
            p.page_category_id,
            pc.name as category_name,
            pc.slug as category_slug,
            p.is_active,
            p.sort_order,
            p.created_at,
            p.updated_at,
            p.meta_title,
            p.meta_description,
            p.content_json,
            p.html_content
          FROM pages p
          LEFT JOIN page_categories pc ON p.page_category_id = pc.id
          ORDER BY pc.sort_order ASC, p.sort_order ASC, p.title ASC
        `);

        res.status(200).json({
          success: true,
          pages: result.rows
        });
        break;

      case 'POST':
        // Create new page
        const { 
          title, 
          slug, 
          type = 'static', 
          page_category_id,
          content_json,
          html_content,
          meta_title,
          meta_description,
          is_active = true,
          sort_order = 0
        } = req.body;

        if (!title || !slug) {
          return res.status(400).json({
            success: false,
            message: 'Title and slug are required'
          });
        }

        // Check if slug already exists
        const existingPage = await query(
          'SELECT id FROM pages WHERE slug = $1',
          [slug]
        );

        if (existingPage.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'A page with this slug already exists'
          });
        }

        // Validate category exists
        if (page_category_id && !isNaN(parseInt(page_category_id))) {
          const categoryExists = await query(
            'SELECT id FROM page_categories WHERE id = $1',
            [parseInt(page_category_id)]
          );

          if (categoryExists.rows.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'Invalid page category'
            });
          }
        }

        // Create the page
        const newPage = await query(`
          INSERT INTO pages (
            title, 
            slug, 
            type, 
            page_category_id,
            content_json,
            html_content,
            meta_title,
            meta_description,
            is_active,
            sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *
        `, [
          title,
          slug,
          type,
          page_category_id ? parseInt(page_category_id) : null,
          type === 'static' ? JSON.stringify(content_json) : null,
          type === 'dynamic' ? html_content : null,
          meta_title,
          meta_description,
          is_active,
          parseInt(sort_order) || 0
        ]);

        res.status(201).json({
          success: true,
          message: 'Page created successfully',
          page: newPage.rows[0]
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Pages API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export default monitorAPIRoute(handler);