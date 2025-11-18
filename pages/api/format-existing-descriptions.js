import { query } from '../../lib/database';
import { formatDescription } from '../../lib/formatDescription';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get all products that need description formatting
    const result = await query(
      'SELECT id, name, description FROM kinguin_products WHERE description IS NOT NULL AND description != \'\''
    );
    
    let processedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const product of result.rows) {
      try {
        const formattedDescription = formatDescription(product.description, product.name);
        
        // Only update if the formatted description is different from the original
        if (formattedDescription !== product.description) {
          await query(
            'UPDATE kinguin_products SET description = $1 WHERE id = $2',
            [formattedDescription, product.id]
          );
          processedCount++;
        }
      } catch (error) {
        errorCount++;
        errors.push({
          productId: product.id,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Description formatting completed',
      stats: {
        totalProducts: result.rows.length,
        processedCount,
        errorCount,
        skippedCount: result.rows.length - processedCount - errorCount
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors if any
    });

  } catch (error) {
    console.error('Error formatting existing descriptions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to format existing descriptions',
      message: error.message
    });
  }
}