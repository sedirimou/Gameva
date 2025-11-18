import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch special pages that should appear in header menu
    const result = await query(`
      SELECT 
        id, 
        slug, 
        title, 
        header_button_title,
        add_to_header_menu,
        sort_order
      FROM special_pages 
      WHERE add_to_header_menu = true
      ORDER BY sort_order ASC, created_at ASC
    `);

    res.status(200).json({
      success: true,
      pages: result.rows
    });

  } catch (error) {
    console.error('Error fetching header menu pages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
}