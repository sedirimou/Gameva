import { query } from '../../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { status, priority, categoryId } = req.query;
      
      let sqlQuery = `
        SELECT 
          ht.*,
          hc.name as category_name,
          hc.slug as category_slug
        FROM help_tickets ht
        LEFT JOIN help_categories hc ON ht.category_id = hc.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (status) {
        params.push(status);
        sqlQuery += ` AND ht.status = $${params.length}`;
      }
      
      if (priority) {
        params.push(priority);
        sqlQuery += ` AND ht.priority = $${params.length}`;
      }
      
      if (categoryId) {
        params.push(categoryId);
        sqlQuery += ` AND ht.category_id = $${params.length}`;
      }
      
      sqlQuery += ` ORDER BY ht.created_at DESC`;
      
      const result = await query(sqlQuery, params);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        category_id, 
        subject, 
        description, 
        priority = 'medium',
        customer_name,
        customer_email
      } = req.body;

      if (!subject || !description) {
        return res.status(400).json({ error: 'Subject and description are required' });
      }

      // Generate ticket number
      const ticketNumber = 'TK' + Date.now().toString().slice(-8);

      const result = await query(`
        INSERT INTO help_tickets (
          ticket_number, category_id, subject, description, priority,
          customer_name, customer_email, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', NOW(), NOW())
        RETURNING *
      `, [ticketNumber, category_id || null, subject, description, priority, customer_name, customer_email]);

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}