import { query } from '../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, limit = 50 } = req.query;

    // If specific entity type requested
    if (type) {
      switch (type) {
        case 'developers':
          const developers = await query(`
            SELECT 
              d.id,
              d.name,
              COUNT(pd.product_id) as product_count
            FROM developers d
            LEFT JOIN product_developers pd ON d.id = pd.developer_id
            GROUP BY d.id, d.name
            ORDER BY product_count DESC, d.name ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'developers',
            data: developers.rows
          });

        case 'publishers':
          const publishers = await query(`
            SELECT 
              p.id,
              p.name,
              COUNT(pp.product_id) as product_count
            FROM publishers p
            LEFT JOIN product_publishers pp ON p.id = pp.publisher_id
            GROUP BY p.id, p.name
            ORDER BY product_count DESC, p.name ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'publishers',
            data: publishers.rows
          });

        case 'genres':
          const genres = await query(`
            SELECT 
              unnest(genres) as name,
              COUNT(*) as product_count
            FROM products 
            WHERE genres IS NOT NULL AND array_length(genres, 1) > 0
            GROUP BY unnest(genres)
            ORDER BY product_count DESC, unnest(genres) ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'genres',
            data: genres.rows
          });

        case 'platforms':
          const platforms = await query(`
            SELECT 
              platform as name,
              COUNT(*) as product_count
            FROM products 
            WHERE platform IS NOT NULL 
            GROUP BY platform
            ORDER BY product_count DESC, platform ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'platforms',
            data: platforms.rows
          });

        case 'languages':
          const languages = await query(`
            SELECT 
              unnest(languages) as name,
              COUNT(*) as product_count
            FROM products 
            WHERE languages IS NOT NULL AND array_length(languages, 1) > 0
            GROUP BY unnest(languages)
            ORDER BY product_count DESC, unnest(languages) ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'languages',
            data: languages.rows
          });

        case 'age_ratings':
          const ageRatings = await query(`
            SELECT 
              ar.id,
              ar.name,
              ar.description,
              COUNT(par.product_id) as product_count
            FROM age_ratings ar
            LEFT JOIN product_age_ratings par ON ar.id = par.age_rating_id
            GROUP BY ar.id, ar.name, ar.description
            ORDER BY product_count DESC, ar.name ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'age_ratings',
            data: ageRatings.rows
          });

        case 'tags':
          const tags = await query(`
            SELECT 
              unnest(tags) as name,
              COUNT(*) as product_count
            FROM products 
            WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
            GROUP BY unnest(tags)
            ORDER BY product_count DESC, unnest(tags) ASC
            LIMIT $1
          `, [limit]);
          
          return res.status(200).json({
            success: true,
            entity_type: 'tags',
            data: tags.rows
          });

        case 'product_types':
          // Official Kinguin Product Types with exact ordering and counts
          const officialTypes = [
            'BASE GAME',
            'PREPAID', 
            'DLC',
            'SOFTWARE',
            'INGAME CURRENCY',
            'BUNDLE',
            'EXPANSION',
            'CS:GO SKINS'
          ];

          // Get product counts for each official type
          const typeCountsResult = await query(`
            SELECT 
              CASE 
                WHEN k.genres && ARRAY['Base Game'] OR k.genres && ARRAY['Game'] THEN 'BASE GAME'
                WHEN k.genres && ARRAY['Prepaid'] OR k.name ILIKE '%prepaid%' OR k.name ILIKE '%gift card%' THEN 'PREPAID'
                WHEN k.genres && ARRAY['DLC'] OR k.name ILIKE '%dlc%' OR k.name ILIKE '%downloadable content%' THEN 'DLC'
                WHEN k.genres && ARRAY['Software'] OR k.platform = 'Software' THEN 'SOFTWARE'
                WHEN k.name ILIKE '%currency%' OR k.name ILIKE '%coins%' OR k.name ILIKE '%credits%' THEN 'INGAME CURRENCY'
                WHEN k.genres && ARRAY['Bundle'] OR k.name ILIKE '%bundle%' OR k.name ILIKE '%pack%' THEN 'BUNDLE'
                WHEN k.genres && ARRAY['Expansion'] OR k.name ILIKE '%expansion%' THEN 'EXPANSION'
                WHEN k.name ILIKE '%cs:go%' AND k.name ILIKE '%skin%' THEN 'CS:GO SKINS'
                ELSE 'BASE GAME'
              END as type_name,
              COUNT(*) as product_count
            FROM products k
            GROUP BY type_name
            ORDER BY type_name
          `, []);

          // Create type counts map
          const typeCountsMap = {};
          typeCountsResult.rows.forEach(row => {
            typeCountsMap[row.type_name] = parseInt(row.product_count);
          });

          // Build official types list with counts in proper order
          const productTypes = officialTypes.map(type => ({
            name: type,
            product_count: typeCountsMap[type] || 0
          }));
          
          return res.status(200).json({
            success: true,
            entity_type: 'product_types',
            data: productTypes
          });

        case 'operating_systems':
          // Operating Systems extracted from systemRequirements JSON
          const operatingSystemsResult = await query(`
            SELECT 
              'Windows' as name,
              COUNT(*) as product_count
            FROM products 
            WHERE platform = 'Steam' OR platform = 'Epic Games Store' OR platform = 'Origin'
            UNION ALL
            SELECT 
              'Mac' as name,
              COUNT(*) as product_count
            FROM products 
            WHERE platform ILIKE '%mac%'
            UNION ALL
            SELECT 
              'Linux' as name,
              COUNT(*) as product_count
            FROM products 
            WHERE platform ILIKE '%linux%'
            ORDER BY product_count DESC
          `, []);

          return res.status(200).json({
            success: true,
            entity_type: 'operating_systems',
            data: operatingSystemsResult.rows
          });

        default:
          return res.status(400).json({
            error: 'Invalid entity type',
            valid_types: ['developers', 'publishers', 'genres', 'platforms', 'languages', 'age_ratings', 'tags']
          });
      }
    }

    // Return summary of all entity types
    const summary = await query(`
      SELECT 
        (SELECT COUNT(*) FROM developers) as developers_count,
        (SELECT COUNT(*) FROM publishers) as publishers_count,
        (SELECT COUNT(*) FROM genres) as genres_count,
        (SELECT COUNT(*) FROM platforms) as platforms_count,
        (SELECT COUNT(*) FROM languages) as languages_count,
        (SELECT COUNT(*) FROM age_ratings) as age_ratings_count,
        (SELECT COUNT(*) FROM tags) as tags_count,
        (SELECT COUNT(*) FROM product_developers) as product_developers_relationships,
        (SELECT COUNT(*) FROM product_publishers) as product_publishers_relationships,
        (SELECT COUNT(*) FROM product_genres) as product_genres_relationships,
        (SELECT COUNT(*) FROM product_platforms) as product_platforms_relationships,
        (SELECT COUNT(*) FROM product_languages) as product_languages_relationships,
        (SELECT COUNT(*) FROM product_age_ratings) as product_age_ratings_relationships,
        (SELECT COUNT(*) FROM product_tags) as product_tags_relationships
    `);

    return res.status(200).json({
      success: true,
      summary: summary.rows[0],
      available_endpoints: {
        developers: '/api/entities?type=developers',
        publishers: '/api/entities?type=publishers', 
        genres: '/api/entities?type=genres',
        platforms: '/api/entities?type=platforms',
        languages: '/api/entities?type=languages',
        age_ratings: '/api/entities?type=age_ratings',
        tags: '/api/entities?type=tags'
      }
    });

  } catch (error) {
    console.error('Entities API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch entity data',
      details: error.message
    });
  }
}