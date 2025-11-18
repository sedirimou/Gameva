/**
 * Admin Typesense API
 * Handles admin operations for Typesense search index
 */

import { 
  initializeCollection, 
  indexProducts, 
  clearProducts, 
  getStats 
} from '../../../lib/typesense';
import { query } from '../../../lib/database';
import { monitorAPIRoute } from '../../../lib/apiMonitor';

export default monitorAPIRoute(async function handler(req, res) {
  
  if (req.method === 'GET') {
    try {
      const { action } = req.query;
      
      if (action === 'stats') {
        const stats = await getStats();
        return res.status(200).json({
          totalDocuments: stats?.totalDocuments || 0,
          name: stats?.name || 'products',
          created: stats?.created || Date.now()
        });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
      
    } catch (error) {
      console.error('❌ Admin Typesense GET error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const { action } = req.body;
      
      if (action === 'reindex') {
        // Initialize collection
        await initializeCollection();
        
        // Fetch all products from database
        const result = await query(`
          SELECT 
            id, name, slug, platform, price, sale_price, final_price,
            genres, images_cover_url, images_cover_thumbnail,
            description, type, age_rating, release_date, created_at
          FROM products 
          WHERE is_active = true
          ORDER BY created_at DESC
        `);
        
        if (result.rows.length > 0) {
          await indexProducts(result.rows);
        }
        
        return res.status(200).json({
          success: true,
          totalIndexed: result.rows.length,
          message: `Successfully indexed ${result.rows.length} products`
        });
      }
      
      if (action === 'clear') {
        await clearProducts();
        return res.status(200).json({
          success: true,
          message: 'Search index cleared successfully'
        });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
      
    } catch (error) {
      console.error('❌ Admin Typesense POST error:', error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
});