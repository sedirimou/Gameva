import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categories array is required' });
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // Update order positions for all categories
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const updateQuery = `
          UPDATE categories 
          SET order_position = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `;
        await query(updateQuery, [i, category.id]);
      }

      // Commit transaction
      await query('COMMIT');

      res.status(200).json({ message: 'Categories reordered successfully' });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
}