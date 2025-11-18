import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const {
      template_key,
      template_name,
      description,
      category,
      subject,
      content,
      is_enabled,
      is_html
    } = req.body;

    // Validate required fields
    if (!template_key || !template_name || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Template key, name, subject, and content are required'
      });
    }

    // Check if template_key already exists
    const existingTemplate = await query(
      'SELECT id FROM email_templates WHERE template_key = $1',
      [template_key]
    );

    if (existingTemplate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Template key already exists. Please use a different key.'
      });
    }

    // Insert new template
    const result = await query(
      `INSERT INTO email_templates 
       (template_key, template_name, description, category, subject, content, is_enabled, is_html, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id`,
      [
        template_key,
        template_name,
        description || '',
        category || 'Account',
        subject,
        content,
        is_enabled !== false, // Default to true
        is_html !== false     // Default to true
      ]
    );

    if (result.rows.length > 0) {
      res.status(201).json({
        success: true,
        message: 'Email template created successfully',
        template_id: result.rows[0].id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create template'
      });
    }

  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}