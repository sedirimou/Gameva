import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { category } = req.query;
      
      let sqlQuery = `
        SELECT 
          id, template_key, template_name, description, category, 
          subject, content, is_enabled, is_html, created_at, updated_at
        FROM email_templates
      `;
      
      const params = [];
      
      if (category) {
        sqlQuery += ' WHERE category = $1';
        params.push(category);
      }
      
      sqlQuery += ' ORDER BY category, template_name';
      
      const result = await query(sqlQuery, params);
      
      // Group templates by category
      const templatesByCategory = result.rows.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
      }, {});
      
      res.status(200).json({
        success: true,
        templates: result.rows,
        templatesByCategory
      });
    } catch (error) {
      console.error('Error fetching email templates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch email templates'
      });
    }
  }
  
  else if (req.method === 'PUT') {
    try {
      const { id, template_name, description, subject, content, is_enabled, is_html } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Template ID is required'
        });
      }
      
      const result = await query(`
        UPDATE email_templates 
        SET 
          template_name = $1,
          description = $2,
          subject = $3,
          content = $4,
          is_enabled = $5,
          is_html = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
      `, [template_name, description, subject, content, is_enabled, is_html, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        template: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update email template'
      });
    }
  }
  
  else if (req.method === 'POST') {
    try {
      const { template_key, template_name, description, category, subject, content, is_enabled = true, is_html = true } = req.body;
      
      if (!template_key || !template_name || !category || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }
      
      const result = await query(`
        INSERT INTO email_templates 
        (template_key, template_name, description, category, subject, content, is_enabled, is_html)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [template_key, template_name, description, category, subject, content, is_enabled, is_html]);
      
      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        template: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create email template'
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed`
    });
  }
}