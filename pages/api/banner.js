import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch the all-products banner from main_menu_items table
    const result = await query(`
      SELECT slug, category_image, banner_images, main_menu_display_type, description 
      FROM main_menu_items 
      WHERE slug = 'all-products' AND is_active = true
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    const banner = result.rows[0];
    
    // Handle both old single image format and new multiple images format
    let images = ['', '', '', ''];
    if (banner.banner_images && Array.isArray(banner.banner_images)) {
      images = banner.banner_images;
    } else if (banner.category_image) {
      images[0] = banner.category_image;
    }
    
    res.status(200).json({
      success: true,
      banner: {
        slug: banner.slug,
        image: banner.category_image, // For backward compatibility
        images: images, // New multiple images format
        display_type: banner.main_menu_display_type || 'carousel',
        description: banner.description
      }
    });

  } catch (error) {
    console.error('Banner API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch banner',
      details: error.message 
    });
  }
}