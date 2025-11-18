import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, session_id, limit = 3 } = req.query;

    if (!user_id && !session_id) {
      // Return empty history instead of error for better UX
      return res.status(200).json({ history: [], total: 0 });
    }

    const searchLimit = Math.min(parseInt(limit) || 3, 10);
    let historyQuery;
    let params;

    if (user_id) {
      historyQuery = `
        SELECT keyword, search_count, last_searched
        FROM search_history
        WHERE user_id = $1
        ORDER BY last_searched DESC
        LIMIT $2
      `;
      params = [user_id, searchLimit];
    } else {
      historyQuery = `
        SELECT keyword, search_count, last_searched
        FROM search_history
        WHERE session_id = $1
        ORDER BY last_searched DESC
        LIMIT $2
      `;
      params = [session_id, searchLimit];
    }

    const result = await query(historyQuery, params);

    const searchHistory = result.rows.map(item => ({
      term: item.keyword,
      count: item.search_count,
      lastSearched: item.last_searched
    }));

    res.status(200).json({
      history: searchHistory,
      total: searchHistory.length
    });

  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}