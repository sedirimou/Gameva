import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { 
        subject, 
        description, 
        category_id, 
        priority = 'medium',
        customer_name,
        customer_email
      } = req.body;

      if (!subject || !description || !customer_email) {
        return res.status(400).json({ error: 'Subject, description, and email are required' });
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

      res.status(201).json({ 
        message: 'Your support ticket has been created successfully',
        ticket: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}