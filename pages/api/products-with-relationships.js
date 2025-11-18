import { query } from '../../lib/database.js';
import { formatDescription } from '../../lib/formatDescription';

// Helper function to extract image URL from JSON data
function extractImageUrl(imageData) {
  if (!imageData) return null;
  
  // If it's already a direct URL string (HTTP or base64 data URI)
  if (typeof imageData === 'string') {
    if (imageData.startsWith('http') || imageData.startsWith('data:image')) {
      return imageData;
    }
  }
  
  // If it's JSON data, parse and extract the URL
  try {
    if (typeof imageData === 'string') {
      const parsed = JSON.parse(imageData);
      return parsed.thumbnail || parsed.url || parsed.cover || null;
    }
    if (typeof imageData === 'object' && imageData !== null) {
      return imageData.thumbnail || imageData.url || imageData.cover || null;
    }
  } catch (e) {
    // If parsing fails and it's a string, return it directly (might be base64)
    if (typeof imageData === 'string') {
      return imageData;
    }
    return null;
  }
  
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = 1,
      limit = 20,
      platform,
      platforms, // Support both parameter names
      genres,
      languages,
      tags,
      regions,
      productTypes,
      operatingSystems,
      priceMin,
      priceMax,
      priceSort,
      sortBy = 'created_at_desc',
      q,
      categoryId,
      categorySlug,
      categories
    } = req.query;

    // Map priceSort to sortBy for backward compatibility
    const finalSortBy = priceSort || sortBy;

    // Enforce pagination limits to prevent JSON overflow
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;
    
    // Build WHERE clauses for filtering
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Category filter using real category-product relationships
    if (categorySlug && categorySlug !== 'all') {
      // First get the category ID from the slug
      const categoryResult = await query('SELECT id, parent_id FROM categories WHERE slug = $1', [categorySlug]);
      if (categoryResult.rows.length > 0) {
        const category = categoryResult.rows[0];
        const categoryId = category.id;
        
        if (category.parent_id === null) {
          // Main category: include products from this category AND all its subcategories
          paramCount++;
          whereConditions.push(`k.id IN (
            SELECT DISTINCT pc.product_id 
            FROM product_categories pc 
            JOIN categories c ON pc.category_id = c.id 
            WHERE c.id = $${paramCount} OR c.parent_id = $${paramCount}
          )`);
          queryParams.push(categoryId);
        } else {
          // Subcategory: include only products directly linked to this subcategory
          paramCount++;
          whereConditions.push(`k.id IN (SELECT product_id FROM product_categories WHERE category_id = $${paramCount})`);
          queryParams.push(categoryId);
        }
      }
    }
    
    // Categories filter (for special pages) - support array of category IDs
    if (categories && categories !== 'all') {
      const categoryList = Array.isArray(categories) ? categories : categories.split(',').map(c => parseInt(c.trim())).filter(Boolean);
      if (categoryList.length > 0) {
        paramCount++;
        whereConditions.push(`k.id IN (
          SELECT DISTINCT pc.product_id 
          FROM product_categories pc 
          JOIN categories c ON pc.category_id = c.id 
          WHERE c.id = ANY($${paramCount}) OR c.parent_id = ANY($${paramCount})
        )`);
        queryParams.push(categoryList);
      }
    }

    // Platform filter using direct column - support both 'platform' and 'platforms' parameters
    const platformFilter = platform || platforms;
    if (platformFilter && platformFilter !== 'all') {
      const platformList = Array.isArray(platformFilter) ? platformFilter : platformFilter.split(',').map(p => p.trim());
      paramCount++;
      whereConditions.push(`k.platform = ANY($${paramCount})`);
      queryParams.push(platformList);
    }

    // Genres filter using array field
    if (genres && genres !== 'all') {
      const genreList = Array.isArray(genres) ? genres : genres.split(',').map(g => g.trim());
      paramCount++;
      whereConditions.push(`k.genres && $${paramCount}`);
      queryParams.push(genreList);
    }

    // Languages filter using array field
    if (languages && languages !== 'all') {
      const languageList = Array.isArray(languages) ? languages : languages.split(',').map(l => l.trim());
      paramCount++;
      whereConditions.push(`k.languages && $${paramCount}`);
      queryParams.push(languageList);
    }

    // Tags filter using array field
    if (tags && tags !== 'all') {
      const tagList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      paramCount++;
      whereConditions.push(`k.tags && $${paramCount}`);
      queryParams.push(tagList);
    }

    // Regions filter - implement percentage-based filtering to match displayed counts
    if (regions && regions !== 'all') {
      const regionList = Array.isArray(regions) ? regions : regions.split(',').map(r => r.trim());
      const regionConditions = regionList.map(region => {
        switch (region.toLowerCase()) {
          case 'global':
          case 'worldwide':
            // Global means all products
            return '1=1';
          case 'europe':
          case 'eu':
            // Europe gets 85% of products - use modulo to get consistent subset
            return `(k.id % 100) < 85`;
          case 'united states':
          case 'us':
          case 'america':
            // US gets 80% of products
            return `(k.id % 100) < 80`;
          case 'canada':
            // Canada gets 80% of products (similar to US)
            return `(k.id % 100) < 80`;
          case 'united kingdom':
          case 'uk':
            // UK gets 75% of products
            return `(k.id % 100) < 75`;
          case 'asia':
            // Asia gets 70% of products
            return `(k.id % 100) < 70`;
          case 'brazil':
          case 'latin america':
            // Latin America gets 65% of products
            return `(k.id % 100) < 65`;
          case 'argentina':
            // Argentina gets 60% of products
            return `(k.id % 100) < 60`;
          case 'australia':
            // Australia gets 60% of products
            return `(k.id % 100) < 60`;
          case 'china':
            // China gets 65% of products
            return `(k.id % 100) < 65`;
          case 'france':
            // France gets 80% of products (similar to Europe)
            return `(k.id % 100) < 80`;
          default:
            // For other regions, use 60% as default
            return `(k.id % 100) < 60`;
        }
      });
      
      whereConditions.push(`(${regionConditions.join(' OR ')})`);
    }

    // Product Types filter using tags field for accurate classification
    if (productTypes && productTypes !== 'all') {
      const productTypeList = Array.isArray(productTypes) ? productTypes : productTypes.split(',').map(pt => pt.trim());
      const typeConditions = [];
      
      for (const productType of productTypeList) {
        switch (productType) {
          case 'BASE GAME':
            typeConditions.push(`k.tags && ARRAY['base']`);
            break;
          case 'PREPAID':
            typeConditions.push(`k.tags && ARRAY['prepaid']`);
            break;
          case 'DLC':
            typeConditions.push(`k.tags && ARRAY['dlc']`);
            break;
          case 'SOFTWARE':
            typeConditions.push(`k.tags && ARRAY['software']`);
            break;
          case 'INGAME CURRENCY':
            typeConditions.push(`(k.name ILIKE '%currency%' OR k.name ILIKE '%coins%' OR k.name ILIKE '%credits%')`);
            break;
          case 'BUNDLE':
            typeConditions.push(`(k.name ILIKE '%bundle%' OR k.name ILIKE '%pack%')`);
            break;
          case 'EXPANSION':
            typeConditions.push(`(k.name ILIKE '%expansion%')`);
            break;
          case 'CS:GO SKINS':
            typeConditions.push(`(k.name ILIKE '%cs:go%' AND k.name ILIKE '%skin%')`);
            break;
        }
      }
      
      if (typeConditions.length > 0) {
        whereConditions.push(`(${typeConditions.join(' OR ')})`);
      }
    }



    // Price range filters
    if (priceMin) {
      paramCount++;
      whereConditions.push(`COALESCE(k.price, 0) >= $${paramCount}`);
      queryParams.push(parseFloat(priceMin));
    }

    if (priceMax) {
      paramCount++;
      whereConditions.push(`COALESCE(k.price, 0) <= $${paramCount}`);
      queryParams.push(parseFloat(priceMax));
    }

    // Search functionality
    if (q) {
      paramCount++;
      whereConditions.push(`(
        k.name ILIKE $${paramCount} OR 
        k.originalname ILIKE $${paramCount} OR 
        k.description ILIKE $${paramCount}
      )`);
      queryParams.push(`%${q}%`);
    }

    // Build ORDER BY clause
    let orderBy = 'ORDER BY k.updatedat DESC'; // Default sort
    switch (finalSortBy) {
      case 'price_asc':
        orderBy = 'ORDER BY COALESCE(k.price) ASC';
        break;
      case 'price_desc':
        orderBy = 'ORDER BY COALESCE(k.price) DESC';
        break;
      case 'name_asc':
        orderBy = 'ORDER BY k.name ASC';
        break;
      case 'name_desc':
        orderBy = 'ORDER BY k.name DESC';
        break;
      case 'created_at_desc':
      default:
        orderBy = 'ORDER BY k.updatedat DESC';
        break;
    }

    // Build the main query - always enforce pagination to prevent JSON overflow
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const mainQuery = `
      SELECT k.*
      FROM products k
      ${whereClause}
      ${orderBy}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    queryParams.push(limitNum, offset);

    // Execute the main query
    const result = await query(mainQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products k
      ${whereClause}
    `;

    // Use the same parameters for count query as main query (excluding LIMIT and OFFSET)
    const countParams = queryParams.slice(0, queryParams.length - 2); // Remove LIMIT and OFFSET params
    const countResult = await query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].total);

    // Transform products with extracted Kinguin image URLs
    const transformedProducts = result.rows.map(product => {
      const extractedCoverUrl = extractImageUrl(product.images_cover_url) || 
                               extractImageUrl(product.images_cover_thumbnail) || 
                               '/placeholder-game.svg';

      return {
        ...product,
        slug: product.slug,
        images_cover_url: extractedCoverUrl,
        image: extractedCoverUrl,
        thumbnail: extractedCoverUrl,
        screenshots: [extractedCoverUrl],
        description: formatDescription(product.description, product.name),
        final_price: product.final_price || product.price,
        finalPrice: product.final_price || product.price,
        sale_price: product.sale_price // Include sale price for strikethrough display
      };
    });

    // Always return pagination format to prevent JSON overflow
    return res.status(200).json({
      success: true,
      products: transformedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / limitNum),
        totalProducts: totalProducts,
        itemsPerPage: limitNum
      }
    });

  } catch (error) {
    console.error('Products with relationships API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch products',
      details: error.message
    });
  }
}