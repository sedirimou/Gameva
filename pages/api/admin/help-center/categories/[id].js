import { query } from '../../../../../lib/database.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          hc.*,
          COUNT(hf.id) as faq_count,
          COUNT(ha.id) as article_count
        FROM help_categories hc
        LEFT JOIN help_faqs hf ON hc.id = hf.category_id AND hf.is_active = true
        LEFT JOIN help_articles ha ON hc.id = ha.category_id AND ha.is_active = true
        WHERE hc.id = $1
        GROUP BY hc.id
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching help category:', error);
      res.status(500).json({ error: 'Failed to fetch help category' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, slug, description, icon, sort_order, is_active } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required' });
      }

      const result = await query(`
        UPDATE help_categories 
        SET 
          name = $1, 
          slug = $2, 
          description = $3, 
          icon = $4, 
          sort_order = $5,
          is_active = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [name, slug, description, icon, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating help category:', error);
      res.status(500).json({ error: 'Failed to update help category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Check if category has any FAQs or articles
      const checkResult = await query(`
        SELECT 
          COUNT(hf.id) as faq_count,
          COUNT(ha.id) as article_count
        FROM help_categories hc
        LEFT JOIN help_faqs hf ON hc.id = hf.category_id
        LEFT JOIN help_articles ha ON hc.id = ha.category_id
        WHERE hc.id = $1
        GROUP BY hc.id
      `, [id]);

      if (checkResult.rows.length > 0) {
        const { faq_count, article_count } = checkResult.rows[0];
        if (parseInt(faq_count) > 0 || parseInt(article_count) > 0) {
          return res.status(400).json({ 
            error: `Cannot delete category. It contains ${faq_count} FAQ(s) and ${article_count} article(s). Please move or delete them first.` 
          });
        }
      }

      // Delete the category
      const deleteResult = await query(`
        DELETE FROM help_categories 
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (deleteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.status(200).json({ message: 'Category deleted successfully', category: deleteResult.rows[0] });
    } catch (error) {
      console.error('Error deleting help category:', error);
      res.status(500).json({ error: 'Failed to delete help category' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}