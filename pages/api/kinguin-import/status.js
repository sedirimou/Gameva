import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get real-time count from products table
      const countResult = await query('SELECT COUNT(*) AS total FROM products');
      const actualProductCount = parseInt(countResult.rows[0].total);
      
      const result = await query('SELECT * FROM kinguin_import_status ORDER BY id DESC LIMIT 1');
      
      if (result.rows.length === 0) {
        // Return default status with real product count
        return res.status(200).json({
          success: true,
          data: {
            total_products: actualProductCount,
            imported: 0,
            skipped: 0,
            errors: 0,
            current_page: 0,
            status: 'Idle'
          }
        });
      }

      // Override total_products with real database count
      const statusData = { ...result.rows[0] };
      statusData.total_products = actualProductCount;

      res.status(200).json({
        success: true,
        data: statusData
      });
    } catch (error) {
      console.error('Error fetching import status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { total_products, imported, skipped, errors, current_page, status } = req.body;

      // Check if status record exists
      const existingResult = await query('SELECT id FROM kinguin_import_status ORDER BY id DESC LIMIT 1');
      
      if (existingResult.rows.length === 0) {
        // Insert new status
        await query(
          `INSERT INTO kinguin_import_status (total_products, imported, skipped, errors, current_page, status, last_update) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [total_products || 0, imported || 0, skipped || 0, errors || 0, current_page || 0, status || 'Idle']
        );
      } else {
        // Update existing status
        await query(
          `UPDATE kinguin_import_status 
           SET total_products = $1, imported = $2, skipped = $3, errors = $4, current_page = $5, status = $6, last_update = NOW()
           WHERE id = $7`,
          [total_products || 0, imported || 0, skipped || 0, errors || 0, current_page || 0, status || 'Idle', existingResult.rows[0].id]
        );
      }

      res.status(200).json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating import status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}