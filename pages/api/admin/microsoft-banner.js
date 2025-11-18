import { query } from '../../../lib/database';
import { requireAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM microsoft_banner 
        WHERE id = 1
      `);

      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        // Return default banner data if none exists
        res.status(200).json({
          title: 'Microsoft Products',
          subtitle: 'Discover the latest Microsoft software and tools',
          image_url: null,
          is_active: true
        });
      }
    } catch (error) {
      console.error('Error fetching Microsoft banner:', error);
      res.status(500).json({ message: 'Error fetching banner data' });
    }
  } else if (req.method === 'POST') {
    try {
      await requireAuth(req, res, async () => {
        const { title, subtitle, image_url, is_active } = req.body;

        // Create table if it doesn't exist
        await query(`
          CREATE TABLE IF NOT EXISTS microsoft_banner (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255),
            subtitle TEXT,
            image_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Upsert banner data
        const result = await query(`
          INSERT INTO microsoft_banner (id, title, subtitle, image_url, is_active, updated_at)
          VALUES (1, $1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (id) 
          DO UPDATE SET 
            title = $1,
            subtitle = $2,
            image_url = $3,
            is_active = $4,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [title, subtitle, image_url, is_active]);

        res.status(200).json({
          success: true,
          data: result.rows[0],
          message: 'Banner updated successfully'
        });
      });
    } catch (error) {
      console.error('Error updating Microsoft banner:', error);
      res.status(500).json({ message: 'Error updating banner data' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}