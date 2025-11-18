/**
 * Product Search API - Powered by Typesense
 * Provides instant, typo-tolerant search for both frontend and admin
 */

import { searchProducts } from '../../../lib/typesense';
import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      q, 
      limit = 10, 
      offset = 0,
      platforms,
      genres,
      languages,
      tags,
      productTypes,
      price_min,
      price_max,
      user_id, 
      session_id 
    } = req.query;

    const searchTerm = q ? q.trim() : '';
    const searchLimit = Math.min(parseInt(limit) || 10, 50);
    const searchOffset = Math.max(parseInt(offset) || 0, 0);

    // Record search history for non-empty queries
    if (searchTerm.length >= 2) {
      try {
        if (user_id) {
          await query(
            `INSERT INTO search_history (user_id, keyword, search_count, last_searched) 
             VALUES ($1, $2, 1, CURRENT_TIMESTAMP) 
             ON CONFLICT (user_id, keyword) 
             DO UPDATE SET search_count = search_history.search_count + 1, 
                          last_searched = CURRENT_TIMESTAMP`,
            [user_id, searchTerm]
          );
        } else if (session_id) {
          await query(
            `INSERT INTO search_history (session_id, keyword, search_count, last_searched) 
             VALUES ($1, $2, 1, CURRENT_TIMESTAMP) 
             ON CONFLICT (session_id, keyword) 
             DO UPDATE SET search_count = search_history.search_count + 1, 
                          last_searched = CURRENT_TIMESTAMP`,
            [session_id, searchTerm]
          );
        }
      } catch (historyError) {
        console.error('Error recording search history:', historyError);
      }
    }

    // If no search term, return empty results
    if (!searchTerm) {
      return res.status(200).json({
        success: true,
        query: '',
        results: [],
        total: 0,
        limit: searchLimit,
        offset: searchOffset,
        hasMore: false
      });
    }

    // Build Typesense filters
    const filters = [];
    
    if (platforms) {
      const platformList = platforms.split(',').map(p => p.trim()).filter(Boolean);
      if (platformList.length > 0) {
        filters.push(`platform:[${platformList.join(',')}]`);
      }
    }
    
    if (genres) {
      const genreList = genres.split(',').map(g => g.trim()).filter(Boolean);
      if (genreList.length > 0) {
        filters.push(`genres:[${genreList.join(',')}]`);
      }
    }
    
    if (price_min) {
      filters.push(`final_price:>=${parseFloat(price_min)}`);
    }
    
    if (price_max) {
      filters.push(`final_price:<=${parseFloat(price_max)}`);
    }

    // Search using Typesense
    const typesenseResults = await searchProducts(searchTerm, {
      page: Math.floor(searchOffset / searchLimit) + 1,
      limit: searchLimit,
      filters: filters.length > 0 ? filters.join(' && ') : undefined
    });

    // Transform results to match existing API format
    const products = typesenseResults.hits.map(product => ({
      id: parseInt(product.id),
      slug: product.slug,
      name: product.name,
      originalName: product.name,
      description: product.description || '',
      platform: product.platform,
      finalPrice: parseFloat(product.final_price) || 0,
      price: parseFloat(product.price) || 0,
      coverUrl: product.images_cover_url || '/placeholder-game.svg',
      coverThumbnail: product.images_cover_thumbnail || product.images_cover_url || '/placeholder-game.svg',
      developers: [],
      publishers: [],
      genres: Array.isArray(product.genres) ? product.genres : [],
      releaseDate: product.release_date || '',
      ageRating: product.age_rating || '',
      screenshotUrls: [],
      languages: [],
      stock: 100, // Default stock for digital products
      inStock: true,
      featured: true,
      commission: 15,
      relevance: 1
    }));

    res.status(200).json({
      success: true,
      query: searchTerm,
      results: products,
      total: typesenseResults.totalHits,
      limit: searchLimit,
      offset: searchOffset,
      hasMore: typesenseResults.totalHits > searchOffset + products.length,
      processingTimeMs: 1 // Typesense is very fast
    });

  } catch (error) {
    console.error('Error in Typesense product search:', error);
    
    // Return empty results instead of error for better UX
    res.status(200).json({
      success: true,
      query: req.query.q || '',
      results: [],
      total: 0,
      limit: parseInt(req.query.limit) || 10,
      offset: parseInt(req.query.offset) || 0,
      hasMore: false,
      error: 'Search service temporarily unavailable'
    });
  }
}