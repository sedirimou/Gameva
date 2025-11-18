import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { id } = req.query;
        
        if (id) {
          // Fetch individual page by ID
          const pageResult = await query(`
            SELECT * FROM special_pages WHERE id = $1
          `, [id]);
          
          if (pageResult.rows.length === 0) {
            return res.status(404).json({ error: 'Page not found' });
          }
          
          const page = pageResult.rows[0];
          
          // Parse JSON fields
          if (page.icon_list) {
            try {
              page.icon_list = JSON.parse(page.icon_list);
            } catch (e) {
              page.icon_list = [];
            }
          }

          if (page.selected_categories) {
            try {
              page.selected_categories = JSON.parse(page.selected_categories);
            } catch (e) {
              page.selected_categories = [];
            }
          }
          
          return res.status(200).json({ page });
        } else {
          // Fetch all pages
          const pages = await query(`
            SELECT id, slug, title, motivation_title, add_to_header_menu, 
                   header_button_title, created_at, updated_at
            FROM special_pages 
            ORDER BY created_at DESC
          `);
          return res.status(200).json({ pages: pages.rows });
        }

      case 'POST':
        const {
          slug,
          title,
          motivation_title,
          description,
          top_banner,
          bottom_description,
          meta_title,
          meta_description,
          meta_keywords,
          sort_order,
          icon_color,
          icon_size,
          icon_quantity,
          icon_opacity,
          icon_height,
          icon_grid_rows,
          icon_grid_columns,
          icon_list,
          icon_placement_type,
          icon_distribution_pattern,
          add_to_header_menu,
          header_button_title,
          background_color,
          selected_categories,
          banner_opacity,
          banner_height,
          bottom_description_width,
          page_max_width
        } = req.body;

        // Validate required fields
        if (!slug || !title) {
          return res.status(400).json({ error: 'Slug and title are required' });
        }

        // Validate FontAwesome icons
        if (icon_list) {
          const icons = typeof icon_list === 'string' 
            ? icon_list.split(',').map(icon => icon.trim()).filter(icon => icon)
            : JSON.parse(icon_list);
          const invalidIcons = icons.filter(icon => !icon.startsWith('fa-'));
          if (invalidIcons.length > 0) {
            return res.status(400).json({ 
              error: `Invalid FontAwesome icons: ${invalidIcons.join(', ')}` 
            });
          }
        }

        const result = await query(`
          INSERT INTO special_pages (
            slug, title, motivation_title, description, top_banner, bottom_description,
            meta_title, meta_description, meta_keywords, sort_order,
            icon_color, icon_size, icon_quantity, icon_opacity, icon_height, icon_grid_rows, icon_grid_columns, icon_list, icon_placement_type, icon_distribution_pattern,
            add_to_header_menu, header_button_title, background_color, selected_categories,
            banner_opacity, banner_height, bottom_description_width, page_max_width,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, CURRENT_TIMESTAMP)
          RETURNING id
        `, [
          slug, title, motivation_title, description, top_banner, bottom_description,
          meta_title, meta_description, meta_keywords, sort_order || 0,
          icon_color || '#ffffff', icon_size || 24, icon_quantity || 6,
          icon_opacity || 50, icon_height || 48, icon_grid_rows || 5, icon_grid_columns || 5,
          icon_list, icon_placement_type || 'random', icon_distribution_pattern || 'random',
          add_to_header_menu || false, header_button_title,
          background_color || '#153e8f', selected_categories,
          banner_opacity || 100, banner_height || 300, 
          bottom_description_width || 1400, page_max_width || 1400
        ]);

        return res.status(201).json({ 
          message: 'Special page created successfully',
          id: result.rows[0].id
        });

      case 'PUT':
        const { id: updateId } = req.query;
        const updateData = req.body;

        if (!updateId) {
          return res.status(400).json({ error: 'Page ID is required' });
        }

        // Validate FontAwesome icons if provided
        if (updateData.icon_list) {
          const icons = typeof updateData.icon_list === 'string' 
            ? updateData.icon_list.split(',').map(icon => icon.trim()).filter(icon => icon)
            : JSON.parse(updateData.icon_list);
          const invalidIcons = icons.filter(icon => !icon.startsWith('fa-'));
          if (invalidIcons.length > 0) {
            return res.status(400).json({ 
              error: `Invalid FontAwesome icons: ${invalidIcons.join(', ')}` 
            });
          }
        }

        const updateFields = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const updateValues = Object.values(updateData);

        await query(`
          UPDATE special_pages 
          SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [updateId, ...updateValues]);

        return res.status(200).json({ message: 'Special page updated successfully' });

      case 'DELETE':
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Page ID is required' });
        }

        await query('DELETE FROM special_pages WHERE id = $1', [deleteId]);
        return res.status(200).json({ message: 'Special page deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Special pages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}