/**
 * Image Upload API
 * Handles image uploads for hero sections and other components
 */
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Disable body parser to handle multipart/form-data
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
    const form = new IncomingForm({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    });

    // Ensure upload directory exists
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        if (!res.headersSent) {
          return res.status(500).json({ 
            error: 'Failed to upload image',
            details: err.message 
          });
        }
        return;
      }

      const file = files.image || files.file;
      if (!file) {
        if (!res.headersSent) {
          return res.status(400).json({ error: 'No image file provided' });
        }
        return;
      }

      // Handle both single file and array
      const imageFile = Array.isArray(file) ? file[0] : file;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(imageFile.mimetype)) {
        // Clean up uploaded file
        try {
          fs.unlinkSync(imageFile.filepath);
        } catch (e) {
          console.error('Cleanup error:', e);
        }
        if (!res.headersSent) {
          return res.status(400).json({ 
            error: 'Invalid file type. Only JPG, PNG, WebP, and SVG are allowed.' 
          });
        }
        return;
      }

      try {
        // Generate unique filename
        const ext = path.extname(imageFile.originalFilename || '');
        const uniqueFilename = `${uuidv4()}${ext}`;
        const finalPath = path.join(uploadDir, uniqueFilename);

        // Move file to final location
        fs.renameSync(imageFile.filepath, finalPath);

        // Return public URL
        const imageUrl = `/uploads/${uniqueFilename}`;

        if (!res.headersSent) {
          return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: uniqueFilename
          });
        }

      } catch (moveError) {
        console.error('File move error:', moveError);
        
        // Clean up temp file if it exists
        try {
          if (fs.existsSync(imageFile.filepath)) {
            fs.unlinkSync(imageFile.filepath);
          }
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }

        if (!res.headersSent) {
          return res.status(500).json({ 
            error: 'Failed to save uploaded image',
            details: moveError.message 
          });
        }
      }
    });

  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}