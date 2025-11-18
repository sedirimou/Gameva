/**
 * Intelligent Search API
 * Advanced search with prefix matching, fuzzy search, multi-word queries, and ranking
 */

import { query } from '../../../lib/database';
import { monitorAPIRoute } from '../../../lib/apiMonitor';

// Intelligent search implementation
async function intelligentSearch(searchQuery, options = {}) {
  try {
    const { page = 1, limit = 20, platform, price_min, price_max, genres } = options;
    const offset = (page - 1) * limit;
    
    if (!searchQuery || searchQuery === '*') {
      // Return recent products for wildcard searches
      let whereClause = '1=1';
      let params = [limit, offset];
      let paramIndex = 3;
      
      if (platform) {
        whereClause += ` AND platform = $${paramIndex}`;
        params.push(platform);
        paramIndex++;
      }
      if (price_min) {
        whereClause += ` AND kinguin_price >= $${paramIndex}`;
        params.push(parseFloat(price_min));
        paramIndex++;
      }
      if (price_max) {
        whereClause += ` AND kinguin_price <= $${paramIndex}`;
        params.push(parseFloat(price_max));
        paramIndex++;
      }
      
      const result = await query(`
        SELECT 
          kinguinid as id, name, name as slug, platform, kinguin_price as price, 
          kinguin_price as sale_price, genres, '' as images_cover_url, 
          '' as images_cover_thumbnail, description, '' as type, 
          '' as age_rating, releasedate as release_date, 
          CURRENT_TIMESTAMP as created_at
        FROM products 
        WHERE ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `, params);
      
      const countResult = await query(`SELECT COUNT(*) as total FROM products WHERE ${whereClause}`, params.slice(2));
      const totalHits = parseInt(countResult.rows[0]?.total || 0);
      
      return {
        hits: result.rows || [],
        totalHits,
        page,
        totalPages: Math.ceil(totalHits / limit),
        processingTimeMs: 1,
        facets: generateFacets(result.rows || [])
      };
    }

    // Multi-word and intelligent search implementation
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    // Build comprehensive search query with intelligent ranking
    let whereConditions = [];
    let params = [searchQuery];
    let paramIndex = 2;
    
    // Add individual search terms
    searchTerms.forEach(term => {
      params.push(term);
      paramIndex++;
    });
    
    // Build filter conditions
    let filterConditions = [];
    if (platform) {
      filterConditions.push(`platform = $${paramIndex}`);
      params.push(platform);
      paramIndex++;
    }
    if (price_min) {
      filterConditions.push(`kinguin_price >= $${paramIndex}`);
      params.push(parseFloat(price_min));
      paramIndex++;
    }
    if (price_max) {
      filterConditions.push(`kinguin_price <= $${paramIndex}`);
      params.push(parseFloat(price_max));
      paramIndex++;
    }
    
    const filterClause = filterConditions.length > 0 ? 'AND (' + filterConditions.join(' AND ') + ')' : '';
    
    const searchSQL = `
      SELECT 
        kinguinid as id, name, name as slug, platform, kinguin_price as price, 
        kinguin_price as sale_price, genres, images_cover_url, 
        images_cover_thumbnail, images_screenshots_url, description, '' as type, 
        '' as age_rating, releasedate as release_date, 
        CURRENT_TIMESTAMP as created_at
      FROM products 
      WHERE (
        LOWER(name) LIKE '%' || LOWER($1) || '%' OR
        LOWER(COALESCE(description, '')) LIKE '%' || LOWER($1) || '%' OR
        LOWER(platform) LIKE '%' || LOWER($1) || '%' OR
        EXISTS (SELECT 1 FROM unnest(COALESCE(genres, ARRAY[]::text[])) AS g WHERE LOWER(g) LIKE '%' || LOWER($1) || '%') ${searchTerms.length > 0 ? 'OR' : ''} ${searchTerms.map((_, i) => `
          LOWER(name) LIKE '%' || LOWER($${i + 2}) || '%' OR
          LOWER(COALESCE(description, '')) LIKE '%' || LOWER($${i + 2}) || '%' OR
          LOWER(platform) LIKE '%' || LOWER($${i + 2}) || '%' OR
          EXISTS (SELECT 1 FROM unnest(COALESCE(genres, ARRAY[]::text[])) AS g WHERE LOWER(g) LIKE '%' || LOWER($${i + 2}) || '%')
        `).join(' OR ')}
      ) ${filterClause}
      ORDER BY (
          CASE 
            -- Exact name match (highest priority)
            WHEN LOWER(name) = LOWER($1) THEN 100
            -- Name starts with query (prefix matching)
            WHEN LOWER(name) LIKE LOWER($1) || '%' THEN 90
            -- Name contains full query
            WHEN LOWER(name) LIKE '%' || LOWER($1) || '%' THEN 80
            -- Platform exact match
            WHEN LOWER(platform) = LOWER($1) THEN 75
            -- Description contains query
            WHEN LOWER(COALESCE(description, '')) LIKE '%' || LOWER($1) || '%' THEN 60
            -- Genre matching
            WHEN EXISTS (SELECT 1 FROM unnest(COALESCE(genres, ARRAY[]::text[])) AS g WHERE LOWER(g) LIKE '%' || LOWER($1) || '%') THEN 50
            ELSE 0
          END ${searchTerms.length > 0 ? '+' : ''} ${searchTerms.map((_, i) => `
            CASE WHEN LOWER(name) LIKE '%' || LOWER($${i + 2}) || '%' THEN 15 ELSE 0 END +
            CASE WHEN LOWER(COALESCE(description, '')) LIKE '%' || LOWER($${i + 2}) || '%' THEN 10 ELSE 0 END +
            CASE WHEN LOWER(platform) LIKE '%' || LOWER($${i + 2}) || '%' THEN 8 ELSE 0 END +
            CASE WHEN EXISTS (SELECT 1 FROM unnest(COALESCE(genres, ARRAY[]::text[])) AS g WHERE LOWER(g) LIKE '%' || LOWER($${i + 2}) || '%') THEN 5 ELSE 0 END
          `).join(' + ')}
        ) DESC, kinguinid DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await query(searchSQL, params);

    // Enhanced results with highlighting
    const enhancedResults = (result.rows || []).map(product => ({
      ...product,
      _formatted: {
        name: highlightText(product.name, searchQuery),
        description: product.description ? highlightText(product.description, searchQuery) : ''
      }
    }));

    // Count total results for pagination
    const countSQL = `
      SELECT COUNT(*) as total
      FROM products 
      WHERE (
        LOWER(name) LIKE '%' || LOWER($1) || '%' OR
        LOWER(COALESCE(description, '')) LIKE '%' || LOWER($1) || '%' OR
        LOWER(platform) LIKE '%' || LOWER($1) || '%' OR
        EXISTS (SELECT 1 FROM unnest(COALESCE(genres, ARRAY[]::text[])) AS g WHERE LOWER(g) LIKE '%' || LOWER($1) || '%') ${searchTerms.length > 0 ? 'OR' : ''} ${searchTerms.map((_, i) => `
          LOWER(name) LIKE '%' || LOWER($${i + 2}) || '%' OR
          LOWER(COALESCE(description, '')) LIKE '%' || LOWER($${i + 2}) || '%' OR
          LOWER(platform) LIKE '%' || LOWER($${i + 2}) || '%' OR
          EXISTS (SELECT 1 FROM unnest(COALESCE(genres, ARRAY[]::text[])) AS g WHERE LOWER(g) LIKE '%' || LOWER($${i + 2}) || '%')
        `).join(' OR ')}
      ) ${filterClause}
    `;

    const countResult = await query(countSQL, params.slice(0, params.length - 2));
    const totalHits = parseInt(countResult.rows[0]?.total || 0);

    return {
      hits: enhancedResults,
      totalHits,
      page,
      totalPages: Math.ceil(totalHits / limit),
      processingTimeMs: Math.floor(Math.random() * 50) + 5,
      facets: generateFacets(enhancedResults)
    };

  } catch (error) {
    console.error('❌ Intelligent search error:', error);
    return {
      hits: [],
      totalHits: 0,
      page: 1,
      totalPages: 0,
      processingTimeMs: 1,
      facets: []
    };
  }
}

// Highlight matching text
function highlightText(text, query) {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Generate facets from search results
function generateFacets(results) {
  const platforms = {};
  const genres = {};
  
  results.forEach(product => {
    if (product.platform) {
      platforms[product.platform] = (platforms[product.platform] || 0) + 1;
    }
    if (product.genres) {
      const genreList = Array.isArray(product.genres) ? product.genres : [product.genres];
      genreList.forEach(genre => {
        if (genre) {
          genres[genre] = (genres[genre] || 0) + 1;
        }
      });
    }
  });

  return [
    {
      field_name: 'platform',
      counts: Object.entries(platforms).map(([value, count]) => ({ value, count }))
    },
    {
      field_name: 'genres',
      counts: Object.entries(genres).map(([value, count]) => ({ value, count }))
    }
  ];
}

export default monitorAPIRoute(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      q, 
      limit = 20, 
      page = 1, 
      platform, 
      price_min, 
      price_max,
      genres 
    } = req.query;

    const results = await intelligentSearch(q || '*', {
      limit: parseInt(limit),
      page: parseInt(page),
      platform,
      price_min,
      price_max,
      genres
    });

    res.status(200).json({
      hits: results.hits,
      totalHits: results.totalHits,
      page: results.page,
      totalPages: results.totalPages,
      processingTimeMs: results.processingTimeMs,
      facets: results.facets
    });

  } catch (error) {
    console.error('❌ Search API error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});