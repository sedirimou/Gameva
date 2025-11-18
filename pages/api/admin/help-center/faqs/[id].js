import { query } from '../../../../../lib/database.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { category_id, question, answer, sort_order, is_active } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: 'Question and answer are required' });
      }

      const result = await query(`
        UPDATE help_faqs 
        SET category_id = $1, question = $2, answer = $3, sort_order = $4, 
            is_active = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [category_id || null, question, answer, sort_order || 0, is_active !== false, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'FAQ not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating FAQ:', error);
      res.status(500).json({ error: 'Failed to update FAQ' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await query(`DELETE FROM help_faqs WHERE id = $1 RETURNING id`, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'FAQ not found' });
      }

      res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      res.status(500).json({ error: 'Failed to delete FAQ' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}