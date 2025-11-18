import { query } from '../../../../lib/database.js';
import { formatDescription } from '../../../../lib/formatDescription.js';
import { calculateProductPrice, getCommissionTier, isKinguinProduct } from '../../../../lib/pricingLogic.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }
  
  if (req.method === 'PUT') {
    return handlePut(req, res, id);
  }
  
  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res, productId) {
  try {
    // Get the main product data
    const productQuery = `
      SELECT 
        p.*, 
        -- Get category from categories table
        COALESCE(
          (SELECT c.id FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = p.id LIMIT 1),
          null
        ) as category_id,
        COALESCE(
          (SELECT c.name FROM product_categories pc JOIN categories c ON pc.category_id = c.id WHERE pc.product_id = p.id LIMIT 1),
          'Uncategorized'
        ) as category_name
      FROM products p
      WHERE p.id = $1
    `;

    const result = await query(productQuery, [productId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];

    // Shipping data is now stored directly in products table
    // Set defaults if shipping fields are empty
    product.shipping_time_value = product.shipping_time_value || '0';
    product.shipping_time_unit = product.shipping_time_unit || 'Instant Delivery';

    // Data is stored directly in product columns as arrays
    // Ensure arrays are properly formatted
    product.tags = Array.isArray(product.tags) ? product.tags : [];
    product.genres = Array.isArray(product.genres) ? product.genres : [];
    product.languages = Array.isArray(product.languages) ? product.languages : [];
    product.developers = Array.isArray(product.developers) ? product.developers : [];
    product.publishers = Array.isArray(product.publishers) ? product.publishers : [];
    
    // Get platforms - check both relationship table and direct column storage
    const platformsQuery = `
      SELECT pp.platform_id, p.title as platform_name
      FROM product_platforms pp 
      JOIN platforms p ON pp.platform_id = p.id 
      WHERE pp.product_id = $1
    `;
    const platformsResult = await query(platformsQuery, [productId]);
    
    // If no platforms in relationship table, check if stored directly in platform column
    if (platformsResult.rows.length === 0 && product.platform) {
      try {
        // Try to find platform by name
        const directPlatformQuery = `
          SELECT id as platform_id, title as platform_name 
          FROM platforms 
          WHERE title ILIKE $1
        `;
        const directPlatformResult = await query(directPlatformQuery, [product.platform]);
        if (directPlatformResult.rows.length > 0) {
          product.platform_relationships = directPlatformResult.rows.map(row => ({
            id: row.platform_id,
            name: row.platform_name
          }));
        } else {
          product.platform_relationships = [];
        }
      } catch (error) {
        console.error('Error processing platform column:', error);
        product.platform_relationships = [];
      }
    } else {
      product.platform_relationships = platformsResult.rows.map(row => ({
        id: row.platform_id,
        name: row.platform_name
      }));
    }
    
    // Get regions - check both relationship table and direct column storage
    const regionsQuery = `
      SELECT pr.region_id, r.name as region_name
      FROM product_regions pr 
      JOIN regions r ON pr.region_id = r.id 
      WHERE pr.product_id = $1
    `;
    const regionsResult = await query(regionsQuery, [productId]);
    
    // If no regions in relationship table, check if stored directly in regionid column
    if (regionsResult.rows.length === 0 && product.regionid) {
      try {
        const directRegionQuery = `
          SELECT id as region_id, name as region_name 
          FROM regions 
          WHERE id = $1
        `;
        const directRegionResult = await query(directRegionQuery, [product.regionid]);
        if (directRegionResult.rows.length > 0) {
          product.region_relationships = directRegionResult.rows.map(row => ({
            id: row.region_id,
            name: row.region_name
          }));
          product.regions = [product.regionid];
        } else {
          product.region_relationships = [];
          product.regions = [];
        }
      } catch (error) {
        console.error('Error processing regionid column:', error);
        product.region_relationships = [];
        product.regions = [];
      }
    } else {
      product.region_relationships = regionsResult.rows.map(row => ({
        id: row.region_id,
        name: row.region_name
      }));
      product.regions = regionsResult.rows.map(row => row.region_id);
    }
    
    product.platforms_ids = platformsResult.rows.map(row => row.platform_id);
    
    // Get categories from product_categories table
    const categoriesQuery = `
      SELECT category_id 
      FROM product_categories 
      WHERE product_id = $1
    `;
    const categoriesResult = await query(categoriesQuery, [productId]);
    product.categories = categoriesResult.rows.map(row => row.category_id);
    
    // Images are now handled via placeholder fallbacks - no database image columns
    product.processed_images = [];
    
    // Process system requirements from systemrequirements column
    if (product.systemrequirements) {
      try {
        // Parse JSON string if it's a string
        if (typeof product.systemrequirements === 'string') {
          product.system_requirements = JSON.parse(product.systemrequirements);
        } else if (typeof product.systemrequirements === 'object') {
          product.system_requirements = product.systemrequirements;
        } else {
          product.system_requirements = [];
        }
      } catch (error) {
        console.error('Error parsing system requirements:', error);
        product.system_requirements = [];
      }
    } else {
      product.system_requirements = [];
    }
    
    // Map database fields to form field names
    product.release_date = product.releasedate || '';
    product.activation_details = product.activationdetails || '';
    product.cover_url = product.images_cover_url || '';
    
    // Fix screenshots parsing - handle JSONB array format
    if (product.images_screenshots) {
      try {
        if (Array.isArray(product.images_screenshots)) {
          // Each screenshot is a JSONB object with url field
          product.screenshots = product.images_screenshots.map(screenshot => {
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
        } else if (typeof product.images_screenshots === 'object') {
          // If it's an object, extract values and parse them
          product.screenshots = Object.values(product.images_screenshots).map(screenshot => {
            if (typeof screenshot === 'string') {
              try {
                const parsed = JSON.parse(screenshot);
                return parsed.url || screenshot;
              } catch (e) {
                return screenshot;
              }
            } else if (typeof screenshot === 'object' && screenshot.url) {
              return screenshot.url;
            }
            return screenshot;
          }).filter(url => url && typeof url === 'string' && url.trim() !== '');
        } else {
          product.screenshots = [];
        }
      } catch (error) {
        console.error('Error parsing screenshots:', error);
        product.screenshots = [];
      }
    } else {
      product.screenshots = [];
    }
    
    product.age_rating = product.agerating || '';
    product.meta_score = product.metacriticscore || '';
    
    // SEO data is stored directly in product columns
    // No additional processing needed

    res.status(200).json({
      success: true,
      product: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handlePut(req, res, productId) {
  try {
    const { 
      name,
      slug,
      short_description,
      description,
      product_note,
      activation_details,
      price,
      sale_price,
      final_price,
      sku,
      ean,
      platform,
      genres,
      languages,
      tags,
      developers,
      publishers,
      regions,
      regional_limitations,
      images,
      images_screenshots,
      images_screenshots_url,
      images_screenshots_thumbnail,
      images_cover,
      images_cover_url,
      images_cover_thumbnail,
      category_id,
      subcategory_id,
      qty = 0,
      stock_quantity,
      limit_per_basket,
      shipping_time = '0',
      shipping_time_value,
      shipping_time_unit,
      automater,
      automater_id,
      product_id,
      release_date,
      age_rating,
      meta_score,
      system_requirements,
      cover_url,
      screenshots,
      featured,
      downloadable,
      virtual,
      manage_stock,
      visibility,
      // SEO fields
      meta_title,
      meta_description,
      meta_keywords,
      og_title,
      og_description,
      og_image_url
    } = req.body;

    // Remove all required field validations to allow flexible product updates

    // Generate slug if not provided and name exists
    const productSlug = slug || (name ? name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') : null);

    // Format description with product title for consistency with Kinguin products
    const formattedDescription = formatDescription(description || '', name);

    // Get current product data to check for Kinguin fields
    const currentProductQuery = await query('SELECT kinguinid, kinguin_price, productid FROM products WHERE id = $1', [productId]);
    const currentProduct = currentProductQuery.rows[0];
    
    // Handle pricing logic: Manual products vs Kinguin products
    let finalPrice = price ? parseFloat(price) : null;
    let commission_tier_id = null;
    let kinguinPrice = null;
    
    // Check if this is a manual product (simple KinguinID like "20")
    const kinguinIdStr = currentProduct?.kinguinid ? String(currentProduct.kinguinid).trim() : '';
    const isManualProduct = !kinguinIdStr || 
                           (kinguinIdStr.length <= 5 && !kinguinIdStr.includes('-')) || 
                           !currentProduct?.kinguin_price;
    
    if (isManualProduct) {
      // MANUAL PRODUCT: Use exact entered price without calculations
      console.log('✋ Manual product detected - using entered price directly:', finalPrice);
      // Keep finalPrice as entered by admin
      commission_tier_id = null;
      kinguinPrice = null;
    } else {
      // KINGUIN PRODUCT: Apply commission calculations
      console.log('🏷️ Kinguin product detected - applying commission calculation');
      
      const productData = {
        price: finalPrice,
        kinguin_price: currentProduct?.kinguin_price,
        kinguinid: currentProduct?.kinguinid,
        productid: currentProduct?.productid || product_id
      };
      
      console.log('💾 Product Update Debug:', {
        productData,
        currentProduct: currentProduct ? {
          kinguinid: currentProduct.kinguinid,
          kinguin_price: currentProduct.kinguin_price,
          productid: currentProduct.productid
        } : null
      });
      
      // Use fresh pricing logic to calculate correct price and commission tier
      const pricingResult = calculateProductPrice(productData);
      
      console.log('💰 Pricing calculation result:', pricingResult);
      
      // Apply the calculated price and commission tier
      finalPrice = pricingResult.price;
      commission_tier_id = pricingResult.commission_tier_id;
      kinguinPrice = pricingResult.kinguin_price;
    }


    // Images are no longer stored in main product table to avoid index size limits

    // Update product in products table with correct column names
    const updateQuery = `
      UPDATE products SET
        name = $1,
        slug = $2,
        description = $3,
        activationdetails = $4,
        price = $5,
        sale_price = $6,
        sku = $7,
        ean = $8,
        platform = $9,
        regionallimitations = $10,
        images = $11,
        images_screenshots = $12,
        images_screenshots_url = $13,
        images_screenshots_thumbnail = $14,
        images_cover = $15,
        images_cover_url = $16,
        images_cover_thumbnail = $17,
        qty = $18,
        limit_per_basket = $19,
        automater_id = $20,
        releasedate = $21,
        agerating = $22,
        metacriticscore = $23,
        systemrequirements = $24::jsonb,
        genres = $25::text[],
        developers = $26::text[],
        publishers = $27::text[],
        languages = $28::text[],
        tags = $29::text[],
        meta_title = $30,
        meta_description = $31,
        meta_keywords = $32,
        og_title = $33,
        og_description = $34,
        og_image_url = $35,
        commission_tier_id = $36,
        updatedat = CURRENT_TIMESTAMP
      WHERE id = $37
    `;

    await query(updateQuery, [
      name,                                                         // $1
      productSlug,                                                 // $2
      formattedDescription,                                        // $3
      activation_details || '',                                    // $4
      finalPrice,                                                  // $5 - price (calculated with commission if Kinguin)
      sale_price ? parseFloat(sale_price) : null,                 // $6
      sku || '',                                                  // $7
      ean || '',                                                  // $8
      platform || 'PC',                                          // $9
      regional_limitations || 'REGION FREE',                      // $10
      images ? JSON.stringify(images) : null,                    // $11
      Array.isArray(screenshots) ? screenshots.filter(s => s && s.trim() !== '') : 
        Array.isArray(images_screenshots) ? images_screenshots.filter(s => s && s.trim() !== '') : [], // $12
      images_screenshots_url || null,                            // $13
      images_screenshots_thumbnail || null,                      // $14
      images_cover ? JSON.stringify(images_cover) : null,        // $15
      cover_url || images_cover_url || null,                     // $16
      images_cover_thumbnail || null,                            // $17
      qty ? parseInt(qty) : 0,                                   // $18
      limit_per_basket ? parseInt(limit_per_basket) : null,      // $19
      automater && automater !== '' ? parseInt(automater) : null, // $20 - automater_id
      release_date || null,                                      // $21 - releasedate
      age_rating || '',                                          // $22 - agerating
      parseFloat(meta_score) || null,                            // $23 - metacriticscore
      system_requirements ? JSON.stringify(system_requirements) : null, // $24 - systemrequirements
      genres ? genres.filter(g => g) : [],                       // $25 - genres array
      developers ? developers.filter(d => d) : [],               // $26 - developers array
      publishers ? publishers.filter(p => p) : [],               // $27 - publishers array
      languages ? languages.filter(l => l) : [],                 // $28 - languages array
      tags ? tags.filter(t => t) : [],                           // $29 - tags array
      meta_title || '',                                          // $30
      meta_description || '',                                    // $31
      meta_keywords || '',                                       // $32
      og_title || '',                                            // $33
      og_description || '',                                      // $34
      og_image_url || '',                                        // $35
      commission_tier_id,                                        // $36
      productId                                                  // $37
    ]);

    // Handle shipping data directly in products table (shipping fields were added to products table)
    if (shipping_time_value !== undefined || shipping_time_unit !== undefined) {
      const shippingValue = shipping_time_value && shipping_time_value !== '' ? parseInt(shipping_time_value) : 0;
      const shippingUnit = shipping_time_unit || 'Instant Delivery';
      
      await query(
        'UPDATE products SET shipping_time_value = $1, shipping_time_unit = $2 WHERE id = $3',
        [shippingValue.toString(), shippingUnit, productId]
      );
    }

    // Update many-to-many relationships
    const updateRelationships = async () => {
      console.log('🔄 Updating category relationships:', {
        productId,
        category_id,
        subcategory_id,
        category_id_type: typeof category_id,
        subcategory_id_type: typeof subcategory_id
      });
      
      // Update category relationships
      await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
      if (category_id) {
        console.log('✅ Inserting main category:', category_id);
        await query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT (product_id, category_id) DO NOTHING',
          [productId, category_id]
        );
      }
      if (subcategory_id && subcategory_id !== category_id) {
        console.log('✅ Inserting subcategory:', subcategory_id);
        await query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT (product_id, category_id) DO NOTHING',
          [productId, subcategory_id]
        );
      } else if (subcategory_id) {
        console.log('⚠️ Subcategory same as main category, skipping:', subcategory_id);
      } else {
        console.log('⚠️ No subcategory provided');
      }

      // Tags are stored directly in products table as array - no relationship table needed

      // Handle platform relationship in product_platforms table
      await query('DELETE FROM product_platforms WHERE product_id = $1', [productId]);
      if (platform && platform !== '') {
        const platformId = parseInt(platform);
        if (!isNaN(platformId)) {
          await query(
            'INSERT INTO product_platforms (product_id, platform_id) VALUES ($1, $2) ON CONFLICT (product_id, platform_id) DO NOTHING',
            [productId, platformId]
          );
        }
      }

      // Handle regions relationship in product_regions table
      await query('DELETE FROM product_regions WHERE product_id = $1', [productId]);
      if (Array.isArray(regions) && regions.length > 0) {
        const validRegions = regions.filter(regionId => regionId && !isNaN(parseInt(regionId)));
        if (validRegions.length > 0) {
          const regionInserts = validRegions.map(regionId => 
            `(${productId}, ${parseInt(regionId)})`
          ).join(',');
          
          await query(`
            INSERT INTO product_regions (product_id, region_id) 
            VALUES ${regionInserts}
          `);
        }
      }
      
      // Genres, languages, developers, publishers are stored directly in products table as arrays - no relationship tables needed
    };

    // Execute relationship updates only (SEO fields are already handled in main products table)
    await updateRelationships();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      productId: productId
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDelete(req, res, productId) {
  try {
    // Remove from related tables first
    await query('DELETE FROM product_categories WHERE product_id = $1', [productId]);
    await query('DELETE FROM product_platforms WHERE product_id = $1', [productId]);
    await query('DELETE FROM product_systems WHERE product_id = $1', [productId]);
    
    // Delete the product
    const result = await query('DELETE FROM products WHERE id = $1', [productId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}