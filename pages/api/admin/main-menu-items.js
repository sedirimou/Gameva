import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return handlePut(req, res);
  }
  
  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ message: 'Method not allowed' });
}

async function handlePut(req, res) {
  try {
    const { slug, category_image, banner_images, main_menu_display_type, main_menu_description } = req.body;
    
    if (!slug) {
      return res.status(400).json({ message: 'Slug is required' });
    }

    console.log('Updating main menu item:', { 
      slug, 
      banner_images: banner_images ? `${banner_images.filter(img => img).length} images provided` : 'no images',
      main_menu_display_type,
      main_menu_description 
    });

    // Update the main menu item data directly in main_menu_items table
    const updateQuery = `
      UPDATE main_menu_items 
      SET 
        category_image = COALESCE($2, category_image),
        banner_images = COALESCE($3, banner_images),
        main_menu_display_type = COALESCE($4, main_menu_display_type),
        description = COALESCE($5, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE slug = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [
      slug,
      category_image || null,
      banner_images ? JSON.stringify(banner_images) : null,
      main_menu_display_type || 'carousel',
      main_menu_description || null
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Main menu item not found' });
    }

    console.log('Successfully updated main menu item:', result.rows[0].id);

    // If there's a linked category, also update it
    if (result.rows[0].category_id) {
      const categoryUpdateQuery = `
        UPDATE categories 
        SET 
          category_image = COALESCE($2, category_image),
          main_menu_display_type = COALESCE($3, main_menu_display_type),
          main_menu_description = COALESCE($4, main_menu_description),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      await query(categoryUpdateQuery, [
        result.rows[0].category_id,
        category_image || null,
        main_menu_display_type || null,
        main_menu_description || null
      ]);
      console.log('Also updated linked category:', result.rows[0].category_id);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Main menu item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating main menu item:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}