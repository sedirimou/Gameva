import { getAuthenticatedUser } from '../../../lib/auth.js';
import { query } from '../../../lib/database.js';

export default async function handler(req, res) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(req);

    if (req.method === 'GET') {
      // Get user preferences
      let preferences = {
        language: 'English US',
        currency: 'EUR'
      };

      if (user) {
        // Load from database for authenticated users
        const result = await query(
          'SELECT preferred_language, preferred_currency FROM users WHERE id = $1',
          [user.id]
        );

        if (result.rows.length > 0) {
          const userData = result.rows[0];
          preferences.language = userData.preferred_language || 'English US';
          preferences.currency = userData.preferred_currency || 'EUR';
        }
      }

      res.status(200).json({ success: true, preferences });

    } else if (req.method === 'POST') {
      const { language, currency } = req.body;

      if (!language && !currency) {
        return res.status(400).json({ 
          success: false, 
          error: 'Language or currency is required' 
        });
      }

      if (user) {
        // Save to database for authenticated users
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (language) {
          updates.push(`preferred_language = $${paramIndex++}`);
          values.push(language);
        }

        if (currency) {
          updates.push(`preferred_currency = $${paramIndex++}`);
          values.push(currency);
        }

        values.push(user.id);

        const updateQuery = `
          UPDATE users 
          SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramIndex}
          RETURNING preferred_language, preferred_currency
        `;

        const result = await query(updateQuery, values);

        res.status(200).json({ 
          success: true, 
          preferences: {
            language: result.rows[0].preferred_language,
            currency: result.rows[0].preferred_currency
          },
          message: 'Preferences saved successfully' 
        });
      } else {
        // For guest users, just return success (preferences will be saved in localStorage)
        res.status(200).json({ 
          success: true, 
          preferences: { language, currency },
          message: 'Preferences saved locally' 
        });
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error handling user preferences:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to handle preferences' 
    });
  }
}