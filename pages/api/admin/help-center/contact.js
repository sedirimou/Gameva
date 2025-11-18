import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT * FROM help_contact_info
        WHERE is_active = true
        ORDER BY sort_order ASC, department ASC
      `);

      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      res.status(500).json({ error: 'Failed to fetch contact info' });
    }
  } else if (req.method === 'POST') {
    try {
      const { department, email, phone, hours, description, sort_order = 0 } = req.body;

      if (!department) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const result = await query(`
        INSERT INTO help_contact_info (department, email, phone, hours, description, sort_order, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        RETURNING *
      `, [department, email, phone, hours, description, sort_order]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating contact info:', error);
      res.status(500).json({ error: 'Failed to create contact info' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}