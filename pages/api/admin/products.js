import { query } from '../../../lib/database.js';
import { calculateProductPrice, isKinguinProduct } from '../../../lib/pricingLogic.js';
import { formatDescription } from '../../../lib/formatDescription.js';
import { monitorAPIRoute } from '../../../lib/apiMonitor.js';
import { ProductAddLogger } from '../../../lib/productAddLogger.js';
import { getProductImageUrl, getProductScreenshots } from '../../../lib/imageUtils.js';
import { indexProduct, deleteProduct } from '../../../lib/typesense';


export default monitorAPIRoute(async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
});

async function handleGet(req, res) {
  try {
    const {
      limit = 25,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'desc',
      search,
      platform,
      category,
      region,
      type,
      system,
      priceMin,
      priceMax,
      commissionMin,
      commissionMax
    } = req.query;

    // Build WHERE conditions
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Enhanced search by name or ID with prioritized matching
    if (search) {
      const searchTerm = search.trim();
      const isNumericSearch = /^\d+$/.test(searchTerm);
      
      const searchConditions = [
        `p.name ILIKE $${paramIndex}`, // Exact match (highest priority)
        `p.name ILIKE $${paramIndex + 1}`, // Contains search term
        `similarity(p.name, $${paramIndex + 2}) > 0.4` // Fuzzy matching with higher threshold
      ];
      
      // Only add ID searches if the search term is numeric
      if (isNumericSearch) {
        searchConditions.push(`p.id = $${paramIndex + 3}`); // Exact ID match
        searchConditions.push(`p.kinguinid = $${paramIndex + 3}`); // Exact Kinguin ID match
      }
      
      conditions.push(`(${searchConditions.join(' OR ')})`);
      params.push(searchTerm); // Exact match
      params.push(`%${searchTerm}%`); // Contains match
      params.push(searchTerm); // Fuzzy match
      
      if (isNumericSearch) {
        params.push(parseInt(searchTerm)); // ID matches (as integer)
        paramIndex += 4;
      } else {
        paramIndex += 3;
      }
    }

    // Platform filter
    if (platform) {
      conditions.push(`p.platform = $${paramIndex}`);
      params.push(platform);
      paramIndex++;
    }

    // Category filter - use proper database relationship
    if (category) {
      conditions.push(`cat.name = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Type filter - use proper database relationship
    if (type) {
      conditions.push(`typ.name = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    // Price range filter
    if (priceMin) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(parseFloat(priceMin));
      paramIndex++;
    }
    if (priceMax) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(parseFloat(priceMax));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort column
    const validSortColumns = ['name', 'price', 'sale_price', 'updatedat'];
    let sortColumn = 'updatedat'; // Default
    if (sortBy === 'name') sortColumn = 'name';
    else if (sortBy === 'price') sortColumn = 'price';
    else if (sortBy === 'final_price' || sortBy === 'sale_price') sortColumn = 'sale_price';
    else if (sortBy === 'updated_at' || sortBy === 'updatedAt') sortColumn = 'updatedat';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Get filtered count from products table
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories cat ON pc.category_id = cat.id
      LEFT JOIN product_types pt ON p.id = pt.product_id
      LEFT JOIN types typ ON pt.type_id = typ.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get products with real categories and types from database relationships
    const productsQuery = `
      SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.sale_price as final_price,
        p.slug,
        p.regionalLimitations as region, 
        p.updatedat as created_at, 
        p.updatedat as updated_at, 
        p.platform,
        0 as commission,
        COALESCE(cat.name, 'Uncategorized') as category,
        COALESCE(typ.name, '') as type,
        p.images_cover_url,
        p.images_cover_thumbnail,
        p.images_screenshots_url,
        p.images_screenshots_thumbnail,
        COALESCE(array_to_string(p.developers, ','), '') as developers,
        COALESCE(array_to_string(p.publishers, ','), '') as publishers,
        COALESCE(array_to_string(p.genres, ','), 'Gaming') as genres,
        COALESCE(p.systemrequirements::text, '{}') as systems,
        'kinguin' as source,
        true as status
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories cat ON pc.category_id = cat.id
      LEFT JOIN product_types pt ON p.id = pt.product_id
      LEFT JOIN types typ ON pt.type_id = typ.id
      ${whereClause}
      ORDER BY ${search ? 
        `CASE 
          WHEN p.name ILIKE $${paramIndex} THEN 1
          WHEN p.name ILIKE $${paramIndex + 1} THEN 2
          WHEN p.name ILIKE $${paramIndex + 2} THEN 3
          ELSE 4
        END, ` : ''}p.${sortColumn} ${sortDirection}
      LIMIT $${search ? paramIndex + 3 : paramIndex} OFFSET $${search ? paramIndex + 4 : paramIndex + 1}
    `;
    
    // Add relevance ordering parameters if searching
    let relevanceParams = [];
    if (search) {
      const searchTerm = search.trim();
      relevanceParams = [searchTerm, `${searchTerm}%`, `%${searchTerm}%`];
    }
    
    const productsParams = [...params, ...relevanceParams, parseInt(limit), parseInt(offset)];
    const productsResult = await query(productsQuery, productsParams);

    // Process results to ensure image URLs are properly extracted using centralized utilities
    const products = productsResult.rows.map(product => ({
      ...product,
      imageUrl: getProductImageUrl(product),
      thumbnailUrl: getProductImageUrl(product),
      screenshotUrls: getProductScreenshots(product)
    }));

    res.status(200).json({
      products,
      total,
      page: Math.ceil(offset / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Admin products fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
}

async function handlePost(req, res) {
  try {
    const { action, productIds, categoryId, systems } = req.body;

    // Handle bulk actions for proper database relationships
    if (action === 'updateCategory' && productIds && categoryId) {
      // Verify category exists
      const categoryResult = await query('SELECT name FROM categories WHERE id = $1', [categoryId]);
      if (categoryResult.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      const categoryName = categoryResult.rows[0].name;
      
      // Remove existing category assignments for these products
      await query(
        'DELETE FROM product_categories WHERE product_id = ANY($1::int[])',
        [productIds]
      );
      
      // Add new category assignments
      const insertValues = productIds.map((productId, index) => 
        `($${index * 2 + 1}, $${index * 2 + 2})`
      ).join(', ');
      
      const insertParams = [];
      productIds.forEach(productId => {
        insertParams.push(productId, categoryId);
      });
      
      await query(
        `INSERT INTO product_categories (product_id, category_id) VALUES ${insertValues}`,
        insertParams
      );
      
      // Update product timestamp
      await query(
        'UPDATE products SET updatedAt = NOW() WHERE id = ANY($1::int[])',
        [productIds]
      );
      
      res.status(200).json({ 
        message: `Updated ${productIds.length} products to category: ${categoryName}` 
      });
      return;
    }

    if (action === 'removeFromCategory' && productIds) {
      // Remove all category assignments for these products
      await query(
        'DELETE FROM product_categories WHERE product_id = ANY($1::int[])',
        [productIds]
      );
      
      // Update product timestamp
      await query(
        'UPDATE products SET updatedAt = NOW() WHERE id = ANY($1::int[])',
        [productIds]
      );
      
      res.status(200).json({ 
        message: `Removed ${productIds.length} products from categories` 
      });
      return;
    }

    if (action === 'updateSystems' && productIds && systems) {
      const updateQuery = `
        UPDATE products 
        SET systemrequirements = $1, updatedAt = NOW() 
        WHERE id = ANY($2::int[])
      `;
      
      await query(updateQuery, [JSON.stringify(systems), productIds]);
      
      res.status(200).json({ 
        message: `Updated ${productIds.length} products systems` 
      });
      return;
    }

    // Handle single product creation (existing functionality)
    const {
      name,
      price,
      sale_price,
      final_price,
      product_id,
      slug,
      platform,
      description,
      genres,
      developers,
      publishers,
      releaseDate,
      tags,
      regionalLimitations,
      systemRequirements,
      system_requirements,
      images,
      stock_status,
      qty,
      limit_per_basket,
      shipping_time_value,
      shipping_time_unit,
      ean,
      sku,
      automater_id,
      pegi_rating,
      meta_score,
      age_rating,
      activation_details,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image_url,
      cover_url,
      screenshots,
      languages,
      regions
    } = req.body;

    // Extract admin info and IP for logging
    const ipAddress = ProductAddLogger.getIpAddress(req);
    const { adminUserId, adminEmail } = ProductAddLogger.getAdminInfo(req);

    // Log field submission for debugging
    await ProductAddLogger.logFieldSubmission({
      payload: req.body,
      adminEmail,
      adminUserId,
      ipAddress
    });

    // Log screenshots array for debugging the JSON issue
    console.log('🔍 Screenshots data type and content:', {
      screenshots,
      isArray: Array.isArray(screenshots),
      type: typeof screenshots,
      length: screenshots?.length,
      firstItem: screenshots?.[0]
    });

    // Remove all required field validations to allow flexible product creation

    const insertQuery = `
      INSERT INTO products (
        name, price, kinguin_price, sale_price, slug, platform, description, genres, developers, publishers,
        releasedate, tags, regionallimitations, systemrequirements, images,
        productid, kinguinid, qty, limit_per_basket,
        ean, sku, automater_id, metacriticscore, agerating, activationdetails,
        meta_title, meta_description, meta_keywords, og_title, og_description, og_image_url,
        images_cover_url, images_screenshots, languages, commission_tier_id, updatedat
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NULL, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32::jsonb[], $33::text[], $34, NOW())
      RETURNING *
    `;

    // Auto-generate Product ID with GV prefix for manual products
    let autoProductId = product_id;
    if (!autoProductId || autoProductId === 'AUTO_GENERATED') {
      // Find the latest GV product ID to increment
      const latestGVResult = await query(
        `SELECT productid FROM products WHERE productid LIKE 'GV%' ORDER BY 
         CAST(SUBSTRING(productid FROM 3) AS INTEGER) DESC LIMIT 1`
      );
      
      let nextNumber = 1;
      if (latestGVResult.rows.length > 0) {
        const latestId = latestGVResult.rows[0].productid;
        if (latestId && typeof latestId === 'string') {
          const currentNumber = parseInt(latestId.substring(2));
          if (!isNaN(currentNumber)) {
            nextNumber = currentNumber + 1;
          }
        }
      }
      
      autoProductId = `GV${nextNumber.toString().padStart(3, '0')}`;
    }
    
    const generatedSlug = slug || name?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    
    // Auto-generate system requirements if not provided
    let autoSystemRequirements = system_requirements || systemRequirements;
    if (!autoSystemRequirements || (Array.isArray(autoSystemRequirements) && autoSystemRequirements.length === 0) || Object.keys(autoSystemRequirements).length === 0) {
      autoSystemRequirements = [
        {
          "system": "Windows", 
          "requirement": [
            "OS: Windows 10 64-bit or newer",
            "Processor: Intel Core i5-8400 / AMD Ryzen 5 2600", 
            "Memory: 8 GB RAM",
            "Graphics: NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 8GB",
            "DirectX: Version 12",
            "Storage: 15 GB available space",
            "Sound Card: DirectX compatible"
          ]
        },
        {
          "system": "Mac", 
          "requirement": [
            "OS: macOS 11.0 or later",
            "Processor: Intel Core i5 or Apple M1",
            "Memory: 8 GB RAM", 
            "Graphics: AMD Radeon Pro 560 or equivalent",
            "Storage: 15 GB available space"
          ]
        }
      ];
    }
    
    // Auto-generate cover image if not provided
    let autoCoverUrl = cover_url;
    if (!autoCoverUrl) {
      // Use high-quality game image from Steam CDN
      const gameImageIds = [
        '730', '1172470', '271590', '570', '440', '252490', '304930', '105600',
        '367520', '413150', '359550', '431960', '582010', '292030', '238960'
      ];
      const randomImageId = gameImageIds[Math.floor(Math.random() * gameImageIds.length)];
      autoCoverUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${randomImageId}/header.jpg`;
    }
    
    // Format description with product title for consistency with Kinguin products
    const formattedDescription = formatDescription(description || '', name);
    
    // Handle pricing logic: Manual products vs Kinguin products
    let productPricing;
    
    // For new product creation, all manually created products should use direct pricing
    // (No Kinguin ID, no kinguin_price = manual product)
    const isManualProduct = true; // All products created through admin form are manual
    
    if (isManualProduct) {
      // MANUAL PRODUCT: Use exact entered price without calculations
      console.log('✋ Manual product creation - using entered price directly:', parseFloat(price) || 0);
      productPricing = {
        price: parseFloat(price) || 0,
        kinguin_price: null,
        commission_tier_id: null,
        calculation_type: 'manual_direct'
      };
    } else {
      // KINGUIN PRODUCT: Apply commission calculations (this path should not occur for manual creation)
      console.log('🏷️ Kinguin product creation - applying commission calculation');
      productPricing = calculateProductPrice({
        price: parseFloat(price) || 0,
        kinguinid: null,
        kinguin_price: null,
        productid: null
      });
    }

    
    const values = [
      name,
      productPricing.price, // Use calculated price (exact entered price for manual products)
      productPricing.kinguin_price, // NULL for manual products
      parseFloat(sale_price) || null,
      generatedSlug,
      platform,
      formattedDescription,
      Array.isArray(genres) ? genres : [],
      Array.isArray(developers) ? developers : [],
      Array.isArray(publishers) ? publishers : [],
      releaseDate || null,
      Array.isArray(tags) ? tags : [],
      regionalLimitations || '',
      JSON.stringify(autoSystemRequirements),
      JSON.stringify(images || {}),
      autoProductId,
      parseInt(qty) || 0,
      parseInt(limit_per_basket) || null,
      ean || null,
      sku || null,
      parseInt(automater_id) || null,
      parseFloat(meta_score) || null,
      age_rating || '',
      activation_details || '',
      meta_title || '',
      meta_description || '',
      meta_keywords || '',
      og_title || '',
      og_description || '',
      og_image_url || '',
      cover_url || autoCoverUrl, // Use cover_url from form
      Array.isArray(screenshots) ? screenshots.map(url => JSON.stringify(url)) : [],
      Array.isArray(languages) ? languages : [],
      productPricing.commission_tier_id  // Use calculated commission tier
    ];

    let result, newProductId;
    
    try {
      // Log detailed parameter information before database operation
      console.log('🔍 Database operation parameters:', {
        queryLength: insertQuery.length,
        valuesCount: values.length,
        screenshots: values[31], // screenshots parameter
        screenshotsType: typeof values[31],
        screenshotsIsArray: Array.isArray(values[31])
      });
      
      result = await query(insertQuery, values);
      newProductId = result.rows[0].id;
      
      // Log successful product creation
      await ProductAddLogger.logSuccess({
        payload: req.body,
        adminEmail,
        adminUserId,
        ipAddress,
        productId: newProductId,
        productName: name
      });
      
      console.log(`✅ Product created successfully: ID ${newProductId}, Name: ${name}`);
      
    } catch (dbError) {
      // Log detailed database error
      await ProductAddLogger.logSystemError({
        payload: req.body,
        adminEmail,
        adminUserId,
        ipAddress,
        errorMessage: dbError.message,
        stackTrace: dbError.stack
      });
      
      console.error('❌ Database operation failed:', {
        error: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
        hint: dbError.hint,
        position: dbError.position
      });
      
      throw dbError; // Re-throw to be caught by outer catch block
    }
    
    // Update shipping data directly in products table (shipping fields were added to products table)
    if (shipping_time_unit && shipping_time_unit !== '') {
      const shippingValue = shipping_time_value && shipping_time_value !== '' ? parseInt(shipping_time_value) : 0;
      await query(
        'UPDATE products SET shipping_time_value = $1, shipping_time_unit = $2 WHERE id = $3',
        [shippingValue.toString(), shipping_time_unit, newProductId]
      );
    } else {
      // Set default "Instant Delivery" for all new products
      await query(
        'UPDATE products SET shipping_time_value = $1, shipping_time_unit = $2 WHERE id = $3',
        ['0', 'Instant Delivery', newProductId]
      );
    }
    
    // Handle regions relationship in product_regions table
    if (Array.isArray(regions) && regions.length > 0) {
      const regionInserts = regions.map(regionId => 
        `(${newProductId}, ${parseInt(regionId)})`
      ).join(',');
      
      await query(`
        INSERT INTO product_regions (product_id, region_id) 
        VALUES ${regionInserts}
      `);
    }
    
    // Automatically fetch real data for the new product
    if (name && name.trim() !== '') {
      try {
        console.log(`Auto-fetching real data for new product: ${name}`);
        
        // Call our real data fetching API internally
        const fetchResponse = await fetch(`${req.headers.origin || 'http://localhost:5000'}/api/admin/fetch-real-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: newProductId,
            gameName: name
          })
        });
        
        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          console.log(`Real data fetched successfully for product ${newProductId}:`, fetchResult.data);
        } else {
          console.log(`Failed to fetch real data for product ${newProductId}`);
        }
      } catch (error) {
        console.log(`Error auto-fetching real data for product ${newProductId}:`, error.message);
      }
    }
    
    res.status(201).json({ 
      message: 'Product created successfully with automatic data fetching',
      product: result.rows[0],
      productId: newProductId
    });

  } catch (error) {
    console.error('Product operation error:', error);
    
    // Log validation errors or other general errors
    const ipAddress = ProductAddLogger.getIpAddress(req);
    const { adminUserId, adminEmail } = ProductAddLogger.getAdminInfo(req);
    
    if (error.code && error.code.startsWith('42')) {
      // PostgreSQL syntax/data type errors
      await ProductAddLogger.logValidationError({
        payload: req.body,
        adminEmail,
        adminUserId,
        ipAddress,
        errorMessage: error.message
      });
    } else {
      // Other system errors
      await ProductAddLogger.logSystemError({
        payload: req.body,
        adminEmail,
        adminUserId,
        ipAddress,
        errorMessage: error.message,
        stackTrace: error.stack
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    const {
      name,
      price,
      sale_price,
      final_price,
      slug,
      platform,
      description,
      genres,
      developers,
      publishers,
      releaseDate,
      tags,
      regionalLimitations,
      systemRequirements,
      images,
      stock_status,
      qty,
      limit_per_basket,
      shipping_time_value,
      shipping_time_unit,
      ean,
      sku,
      automater_id,
      pegi_rating,
      meta_score,
      activation_details,
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image_url,
      cover_url,
      screenshots
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Format description with product title for consistency with Kinguin products
    const formattedDescription = formatDescription(description || '', name);

    const updateQuery = `
      UPDATE products SET
        name = $1,
        kinguin_price = $2,
        sale_price = $3,
        slug = $4,
        platform = $5,
        description = $6,
        genres = $7,
        developers = $8,
        publishers = $9,
        releasedate = $10,
        tags = $11,
        regionallimitations = $12,
        systemrequirements = $13,
        images = $14,
        qty = $15,
        limit_per_basket = $16,
        ean = $17,
        sku = $18,
        automater_id = $19,
        metacriticscore = $20,
        activationdetails = $21,
        meta_title = $22,
        meta_description = $23,
        meta_keywords = $24,
        og_title = $25,
        og_description = $26,
        og_image_url = $27,
        images_cover_url = $28,
        images_screenshots = $29,
        updatedat = NOW()
      WHERE id = $30
      RETURNING *
    `;

    const values = [
      name,
      parseFloat(kinguin_price) || null,
      parseFloat(sale_price) || null,
      slug || name?.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
      platform,
      formattedDescription,
      genres || [],
      developers || [],
      publishers || [],
      releaseDate || null,
      tags || [],
      regionalLimitations || '',
      JSON.stringify(systemRequirements || {}),
      JSON.stringify(images || {}),
      stock_status || 'GOOD',
      parseInt(qty) || 0,
      parseInt(limit_per_basket) || null,
      parseInt(shipping_time_value) || 0,
      shipping_time_unit || 'Minutes',
      ean || null,
      sku || null,
      parseInt(automater_id) || null,
      pegi_rating || null,
      parseFloat(meta_score) || null,
      activation_details || '',
      meta_title || '',
      meta_description || '',
      meta_keywords || '',
      og_title || '',
      og_description || '',
      og_image_url || '',
      cover_url || '',
      screenshots || [],
      parseInt(id)
    ];

    const result = await query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ 
      message: 'Product updated successfully',
      product: result.rows[0] 
    });

  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
}