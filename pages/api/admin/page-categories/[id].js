import { query } from '../../../../lib/database';
import { monitorAPIRoute } from '../../../../lib/apiMonitor';

async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        // Get single category
        const result = await query(`
          SELECT 
            id, 
            name, 
            slug, 
            description, 
            sort_order,
            created_at,
            updated_at,
            (SELECT COUNT(*) FROM pages WHERE page_category_id = page_categories.id) as page_count
          FROM page_categories 
          WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }

        res.status(200).json({
          success: true,
          category: result.rows[0]
        });
        break;

      case 'PUT':
        // Update category (limited to description and sort_order only)
        const { description, sort_order } = req.body;
        
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'Category ID is required'
          });
        }

        // Validate sort_order
        if (sort_order && (sort_order < 1 || sort_order > 8)) {
          return res.status(400).json({
            success: false,
            message: 'Sort order must be between 1 and 8'
          });
        }

        const updateResult = await query(`
          UPDATE page_categories 
          SET 
            description = COALESCE($1, description),
            sort_order = COALESCE($2, sort_order),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *
        `, [description, sort_order, id]);

        if (updateResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Category not found'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Category updated successfully',
          category: updateResult.rows[0]
        });
        break;

      case 'DELETE':
        // Delete not allowed for footer categories
        res.status(405).json({
          success: false,
          message: 'Deleting footer categories is not allowed'
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error occurred',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default monitorAPIRoute(handler);