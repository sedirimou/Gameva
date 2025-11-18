/**
 * Contact Form Submission API
 * Handles contact form submissions with file attachments
 */
import { query } from '../../lib/database';
import formidable from 'formidable';
import path from 'path';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data including files
    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB
      filter: ({ name, originalFilename, mimetype }) => {
        // Only allow specific image types
        return mimetype && mimetype.startsWith('image/') && 
               ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(mimetype);
      }
    });

    const [fields, files] = await form.parse(req);

    // Extract form data
    const email = Array.isArray(fields.email) ? fields.email[0] : fields.email;
    const orderNumber = Array.isArray(fields.orderNumber) ? fields.orderNumber[0] : fields.orderNumber;
    const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;

    // Validate required fields
    if (!email || !subject || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, subject, and description are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Handle file attachments
    let attachmentPaths = [];
    if (files.attachments) {
      const attachmentFiles = Array.isArray(files.attachments) ? files.attachments : [files.attachments];
      
      for (const file of attachmentFiles) {
        if (file && file.filepath) {
          // Generate unique filename
          const uniqueName = `contact_${Date.now()}_${file.originalFilename}`;
          const newPath = path.join('./public/uploads', uniqueName);
          
          // Move file to final location
          await fs.rename(file.filepath, newPath);
          attachmentPaths.push(`/uploads/${uniqueName}`);
        }
      }
    }

    // Insert contact submission into database
    const insertQuery = `
      INSERT INTO contact_submissions (
        email, 
        order_number, 
        subject, 
        description, 
        attachments,
        source, 
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `;

    const values = [
      email.trim().toLowerCase(),
      orderNumber?.trim() || null,
      subject.trim(),
      description.trim(),
      attachmentPaths.length > 0 ? JSON.stringify(attachmentPaths) : null,
      'Modern Contact Form',
      'new'
    ];

    const result = await query(insertQuery, values);
    const submissionId = result.rows[0].id;

    // Log successful submission
    console.log(`📧 New contact submission #${submissionId} from ${email} with ${attachmentPaths.length} attachments`);

    return res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId,
      attachments: attachmentPaths.length
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit contact form'
    });
  }
}

// Create contact_submissions table if it doesn't exist
export async function createContactSubmissionsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      order_number VARCHAR(100),
      subject VARCHAR(500) NOT NULL,
      description TEXT NOT NULL,
      attachments TEXT, -- JSON array of file paths
      source VARCHAR(100) DEFAULT 'Contact Form',
      status VARCHAR(50) DEFAULT 'new',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
    CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
  `;

  try {
    await query(createTableQuery);
    console.log('✅ Contact submissions table ready');
  } catch (error) {
    console.error('❌ Error creating contact submissions table:', error);
  }
}

// Initialize table on module load
createContactSubmissionsTable();