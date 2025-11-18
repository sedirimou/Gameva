import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    } else if (req.method === 'POST') {
      return await handlePost(req, res);
    } else if (req.method === 'PUT') {
      return await handlePut(req, res);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Product notes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req, res) {
  try {
    const result = await query(`
      SELECT 
        pcn.id,
        pcn.note_type,
        pcn.category_id,
        pcn.category_ids,
        pcn.product_ids,
        pcn.title_1,
        pcn.title_2,
        pcn.note,
        pcn.created_at,
        pcn.updated_at,
        c.name as category_name,
        CASE 
          WHEN pcn.note_type = 'category' AND pcn.category_ids IS NOT NULL THEN (
            SELECT COUNT(DISTINCT pc.product_id) 
            FROM product_categories pc 
            WHERE pc.category_id = ANY(pcn.category_ids)
          )
          WHEN pcn.note_type = 'category' AND pcn.category_id IS NOT NULL THEN (
            SELECT COUNT(pc.product_id) 
            FROM product_categories pc 
            WHERE pc.category_id = pcn.category_id
          )
          WHEN pcn.note_type = 'product' THEN array_length(pcn.product_ids, 1)
          ELSE 0
        END as product_count
      FROM product_category_notes pcn
      LEFT JOIN categories c ON pcn.category_id = c.id
      ORDER BY pcn.updated_at DESC
    `);
    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching product notes:', error);
    return res.status(500).json({ error: 'Failed to fetch product notes' });
  }
}

async function handlePost(req, res) {
  try {
    const { note_type, category_ids, product_ids, title_1, title_2, note } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    if (!note_type || !['category', 'product'].includes(note_type)) {
      return res.status(400).json({ error: 'Valid note type is required (category or product)' });
    }

    const createdNotes = [];

    if (note_type === 'category') {
      if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
        return res.status(400).json({ error: 'At least one category is required for category notes' });
      }

      // Create a single note for all selected categories
      const noteResult = await query(`
        INSERT INTO product_category_notes (note_type, category_ids, title_1, title_2, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, note_type, category_ids, title_1, title_2, note, created_at, updated_at
      `, ['category', category_ids, title_1 || null, title_2 || null, note]);
      createdNotes.push(noteResult.rows[0]);
    } else if (note_type === 'product') {
      if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({ error: 'At least one product is required for product notes' });
      }

      // Create a single note entry with multiple product IDs
      const noteResult = await query(`
        INSERT INTO product_category_notes (note_type, product_ids, title_1, title_2, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, note_type, product_ids, title_1, title_2, note, created_at, updated_at
      `, ['product', product_ids, title_1 || null, title_2 || null, note]);
      createdNotes.push(noteResult.rows[0]);
    }

    return res.status(201).json({ 
      message: note_type === 'category' ? 
        `Note created for ${category_ids?.length || 0} categories` : 
        `Note created for ${product_ids?.length || 0} products`,
      notes: createdNotes 
    });
  } catch (error) {
    console.error('Error creating product note:', error);
    return res.status(500).json({ error: 'Failed to create product note' });
  }
}

async function handlePut(req, res) {
  try {
    const { id, note_type, category_ids, product_ids, title_1, title_2, note } = req.body;

    if (!id || !note) {
      return res.status(400).json({ error: 'ID and note content are required' });
    }

    if (!note_type || !['category', 'product'].includes(note_type)) {
      return res.status(400).json({ error: 'Valid note type is required (category or product)' });
    }

    // Delete the existing note
    await query(`DELETE FROM product_category_notes WHERE id = $1`, [id]);

    // Create updated note with new unified structure
    let updatedNote;
    if (note_type === 'category') {
      if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
        return res.status(400).json({ error: 'At least one category is required for category notes' });
      }

      const noteResult = await query(`
        INSERT INTO product_category_notes (note_type, category_ids, title_1, title_2, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, note_type, category_ids, title_1, title_2, note, created_at, updated_at
      `, [note_type, category_ids, title_1 || null, title_2 || null, note]);
      updatedNote = noteResult.rows[0];
    } else if (note_type === 'product') {
      if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
        return res.status(400).json({ error: 'At least one product is required for product notes' });
      }

      const noteResult = await query(`
        INSERT INTO product_category_notes (note_type, product_ids, title_1, title_2, note)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, note_type, product_ids, title_1, title_2, note, created_at, updated_at
      `, [note_type, product_ids, title_1 || null, title_2 || null, note]);
      updatedNote = noteResult.rows[0];
    }

    return res.status(200).json({ 
      message: note_type === 'category' ? 
        `Note updated for ${category_ids?.length || 0} categories` : 
        `Note updated for ${product_ids?.length || 0} products`,
      note: updatedNote 
    });
  } catch (error) {
    console.error('Error updating product note:', error);
    return res.status(500).json({ error: 'Failed to update product note' });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    const result = await query(`
      DELETE FROM product_category_notes 
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product note not found' });
    }

    return res.status(200).json({ message: 'Product note deleted successfully' });
  } catch (error) {
    console.error('Error deleting product note:', error);
    return res.status(500).json({ error: 'Failed to delete product note' });
  }
}