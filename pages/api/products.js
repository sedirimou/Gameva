import prisma from '../../lib/prisma';
import { formatDescription } from '../../lib/formatDescription';
import { getProductImageUrl, getProductScreenshots } from '../../lib/imageUtils';
import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { slug } = req.query;
    
    if (slug) {
      try {
        // First try to find product by stored slug using Prisma
        let product = await prisma.product.findFirst({
          where: {
            slug: slug
          }
        });

        // If not found by slug, try to find by name-based slug generation
        if (!product) {
          const allProducts = await prisma.product.findMany({
            where: {
              name: {
                not: null
              }
            },
            select: {
              id: true,
              name: true,
              slug: true
            }
          });
          
          // Find product by generating slug from name
          for (const p of allProducts) {
            const generatedSlug = p.name ? p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : '';
            if (generatedSlug === slug) {
              product = await prisma.product.findUnique({
                where: { id: p.id }
              });
              break;
            }
          }
        }

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // Get product notes from database
        let productNotes = [];
        try {
          // Use direct database query to get notes for this product
          const { query } = await import('../../lib/database.js');
          
          // First try direct product notes
          const directNotes = await query(`
            SELECT id, note_type, title_1, title_2, note, created_at
            FROM product_category_notes
            WHERE note_type = 'product' AND $1 = ANY(product_ids)
            ORDER BY created_at DESC
            LIMIT 1
          `, [product.id]);
          
          if (directNotes.rows.length > 0) {
            productNotes = directNotes.rows;
          } else {
            // Try category-based notes
            const categoryNotes = await query(`
              SELECT pcn.id, pcn.note_type, pcn.title_1, pcn.title_2, pcn.note, pcn.created_at
              FROM product_category_notes pcn
              JOIN product_categories pc ON (
                pcn.note_type = 'category' AND 
                (pc.category_id = pcn.category_id OR pc.category_id = ANY(pcn.category_ids))
              )
              WHERE pc.product_id = $1
              ORDER BY pcn.created_at DESC
              LIMIT 1
            `, [product.id]);
            
            productNotes = categoryNotes.rows;
          }
        } catch (error) {
          console.error('Error fetching product notes:', error);
          productNotes = [];
        }
        
        // Get age rating based on product.agerating
        let ageRatingDetails = null;
        if (product.agerating) {
          try {
            const ageRatingResult = await query(`
              SELECT id, title, secondary_title, description, icon_url
              FROM age_ratings
              WHERE title = $1
              LIMIT 1
            `, [product.agerating]);
            
            if (ageRatingResult.rows.length > 0) {
              ageRatingDetails = ageRatingResult.rows[0];
              console.log(`🔞 Product ${product.id} age rating:`, ageRatingDetails.title, 'found');
            }
          } catch (error) {
            console.error('Error fetching age rating for product', product.id, error);
          }
        }

        // Parse JSONB screenshot format using centralized function
        const screenshotUrls = getProductScreenshots(product);
        console.log(`📸 Product ${product.id} screenshots:`, screenshotUrls.length, 'found');

        // Parse system requirements
        let systemRequirements = [];
        if (product.systemrequirements) {
          try {
            if (typeof product.systemrequirements === 'string') {
              systemRequirements = JSON.parse(product.systemrequirements);
            } else if (Array.isArray(product.systemrequirements)) {
              systemRequirements = product.systemrequirements;
            }
            console.log(`🖥️ Product ${product.id} system requirements:`, systemRequirements.length, 'sections found');
          } catch (error) {
            console.error('Error parsing system requirements for product', product.id, error);
            systemRequirements = [];
          }
        }

        // Combine the data
        const result = {
          ...product,
          screenshotUrls: screenshotUrls,
          screenshot_urls: screenshotUrls,
          coverUrl: getProductImageUrl(product),
          cover_url: getProductImageUrl(product),
          systemRequirements: systemRequirements,
          system_requirements: systemRequirements,
          note: productNotes[0]?.note || null,
          note_title_1: productNotes[0]?.title_1 || null,
          note_title_2: productNotes[0]?.title_2 || null,
          note_source: productNotes[0]?.note_type || null,
          ageRatingDetails: ageRatingDetails,
          age_rating_title: ageRatingDetails?.title || null,
          age_rating_secondary: ageRatingDetails?.secondary_title || null,
          age_rating_description: ageRatingDetails?.description || null,
          age_rating_icon: ageRatingDetails?.icon_url || null
        };
        
        // Combine the data and return
        return res.json(result);
        
      } catch (error) {
        console.error('Error in product slug API:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    
    // Handle regular product listing
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        platform, 
        genre, 
        region, 
        search, 
        priceRange, 
        exclude,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Build where clause
      const whereClause = {
        AND: []
      };

      // Exclude specific product
      if (exclude) {
        whereClause.AND.push({
          id: { not: parseInt(exclude) }
        });
      }

      // Category filter
      if (category && category !== 'all-products') {
        whereClause.AND.push({
          ProductCategory: {
            some: {
              Category: {
                slug: category
              }
            }
          }
        });
      }

      // Search filter
      if (search) {
        whereClause.AND.push({
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        });
      }

      // Determine ordering method
      let orderByClause;
      if (req.query.random === 'true') {
        // For random products, we'll use a different approach with raw query
        // since Prisma doesn't support ORDER BY RANDOM() directly
        orderByClause = { id: 'desc' }; // fallback for now
      } else {
        orderByClause = { id: 'desc' };
      }

      // Get products from database
      let products;
      if (req.query.random === 'true') {
        // Use raw query for true randomization
        const excludeId = exclude ? parseInt(exclude) : null;
        if (excludeId) {
          products = await prisma.$queryRaw`
            SELECT * FROM products 
            WHERE id != ${excludeId}
            ORDER BY RANDOM() 
            LIMIT ${parseInt(limit)}
          `;
        } else {
          products = await prisma.$queryRaw`
            SELECT * FROM products 
            ORDER BY RANDOM() 
            LIMIT ${parseInt(limit)}
          `;
        }
      } else {
        products = await prisma.product.findMany({
          where: whereClause.AND.length > 0 ? whereClause : {},
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: orderByClause
        });
      }

      // Transform database products to match expected frontend format
      const transformedProducts = products.map(product => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        originalName: product.originalname || product.name,
        description: formatDescription(product.description || '', product.name),
        platform: product.platform,
        finalPrice: parseFloat(product.sale_price) || parseFloat(product.price) || 0,
        price: parseFloat(product.price) || 0,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
        final_price: parseFloat(product.sale_price) || parseFloat(product.price) || 0,
        coverUrl: getProductImageUrl(product),
        cover_url: getProductImageUrl(product),
        coverThumbnail: getProductImageUrl(product),
        developers: product.developers || [],
        publishers: product.publishers || [],
        genres: product.genres || [],
        releaseDate: product.releasedate || '',
        release_date: product.releasedate || '',
        ageRating: product.agerating || '',
        age_rating: product.agerating || '',
        screenshotUrls: (() => {
          // Parse JSONB screenshot format from database
          if (product.images_screenshots) {
            try {
              if (Array.isArray(product.images_screenshots)) {
                // Each screenshot is a JSONB object with url field
                const urls = product.images_screenshots.map(screenshot => {
                  if (typeof screenshot === 'string') {
                    try {
                      // Parse the JSON string to get the object
                      const parsed = JSON.parse(screenshot);
                      return parsed.url || screenshot;
                    } catch (e) {
                      // If it fails to parse, treat as plain URL
                      return screenshot;
                    }
                  } else if (typeof screenshot === 'object' && screenshot.url) {
                    // Already an object with url property
                    return screenshot.url;
                  }
                  return screenshot;
                }).filter(url => url && typeof url === 'string' && url.trim() !== '');
                
                if (urls.length > 0) return urls;
              }
            } catch (error) {
              console.error('Error parsing screenshots for product', product.id, error);
            }
          }
          
          // Fallback: Use images_screenshots_url (single URL)
          if (product.images_screenshots_url && product.images_screenshots_url.trim() !== '') {
            return [product.images_screenshots_url];
          }
          return [];
        })(),
        screenshot_urls: (() => {
          // Parse JSONB screenshot format from database
          if (product.images_screenshots) {
            try {
              if (Array.isArray(product.images_screenshots)) {
                // Each screenshot is a JSONB object with url field
                const urls = product.images_screenshots.map(screenshot => {
                  if (typeof screenshot === 'string') {
                    try {
                      // Parse the JSON string to get the object
                      const parsed = JSON.parse(screenshot);
                      return parsed.url || screenshot;
                    } catch (e) {
                      // If it fails to parse, treat as plain URL
                      return screenshot;
                    }
                  } else if (typeof screenshot === 'object' && screenshot.url) {
                    // Already an object with url property
                    return screenshot.url;
                  }
                  return screenshot;
                }).filter(url => url && typeof url === 'string' && url.trim() !== '');
                
                if (urls.length > 0) return urls;
              }
            } catch (error) {
              console.error('Error parsing screenshots for product', product.id, error);
            }
          }
          
          // Fallback: Use images_screenshots_url (single URL)
          if (product.images_screenshots_url && product.images_screenshots_url.trim() !== '') {
            return [product.images_screenshots_url];
          }
          return [];
        })(),
        systemRequirements: (() => {
          try {
            if (typeof product.systemrequirements === 'string') {
              return JSON.parse(product.systemrequirements);
            }
            return product.systemrequirements || [];
          } catch (e) {
            return product.systemrequirements || [];
          }
        })(),
        system_requirements: (() => {
          try {
            if (typeof product.systemrequirements === 'string') {
              return JSON.parse(product.systemrequirements);
            }
            return product.systemrequirements || [];
          } catch (e) {
            return product.systemrequirements || [];
          }
        })(),
        tags: product.tags,
        videos: product.videos,
        regionallimitations: product.regionallimitations,
        regionLimitations: product.regionallimitations,
        countrylimitation: product.countrylimitation || [],
        // Shipping information
        shipping_time_value: product.shipping_time_value || '0',
        shipping_time_unit: product.shipping_time_unit || 'Instant Delivery',
        activationDetails: product.activationdetails,
        activationdetails: product.activationdetails,
        images: product.images, // Add images JSON column for screenshots access
        // Cart limit enforcement field
        limit_per_basket: product.limit_per_basket || null,
        limitPerBasket: product.limit_per_basket || null
      }));

      // Get total count for pagination
      const totalCount = await prisma.product.count({
        where: whereClause.AND.length > 0 ? whereClause : {}
      });

      return res.status(200).json({
        success: true,
        products: transformedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    const { ids, productIds } = req.body;
    const targetIds = ids || productIds;
    
    if (!targetIds || !Array.isArray(targetIds)) {
      return res.status(400).json({ error: 'Product IDs array is required' });
    }
    
    try {
      // Fetch multiple products by IDs using Prisma
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: targetIds.map(id => parseInt(id))
          }
        }
      });
      
      const transformedProducts = products.map(dbProduct => ({
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        originalName: dbProduct.originalname || dbProduct.name,
        description: formatDescription(dbProduct.description || '', dbProduct.name),
        platform: dbProduct.platform,
        price: parseFloat(dbProduct.price) || 0,
        sale_price: dbProduct.sale_price ? parseFloat(dbProduct.sale_price) : null,
        finalPrice: parseFloat(dbProduct.sale_price) || parseFloat(dbProduct.price) || 0,
        coverUrl: getProductImageUrl(dbProduct),
        images_cover_url: dbProduct.images_cover_url, // Raw DB field for hierarchy
        images_cover: dbProduct.images_cover, // Raw DB field for hierarchy
        images_cover_thumbnail: dbProduct.images_cover_thumbnail, // Raw DB field for hierarchy
        cover_url: getProductImageUrl(dbProduct),
        coverThumbnail: getProductImageUrl(dbProduct),
        cover_thumbnail: getProductImageUrl(dbProduct),
        images: dbProduct.images,
        developers: dbProduct.developers || [],
        publishers: dbProduct.publishers || [],
        genres: dbProduct.genres || [],
        releaseDate: dbProduct.releasedate || '',
        ageRating: dbProduct.agerating || '',
        screenshotUrls: Array.isArray(dbProduct.images_screenshots_url) 
          ? dbProduct.images_screenshots_url 
          : (dbProduct.images_screenshots_url ? [dbProduct.images_screenshots_url] : []),
        images_screenshots_url: dbProduct.images_screenshots_url,
        images_screenshots: dbProduct.images_screenshots,
        images_screenshots_thumbnail: dbProduct.images_screenshots_thumbnail,
        languages: dbProduct.languages || [],
        stock: dbProduct.qty || 0,
        inStock: (dbProduct.qty || 0) > 0,
        featured: true,
        commission: 15
      }));
      
      res.status(200).json(transformedProducts);
    } catch (error) {
      console.error('Error fetching products by IDs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}