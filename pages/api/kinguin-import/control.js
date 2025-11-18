import { query } from '../../../lib/database';
import { formatDescription } from '../../../lib/formatDescription';
import { calculateProductPrice } from '../../../lib/pricingLogic';

// In-memory import state (in production, use Redis or database)
let importState = {
  isRunning: false,
  currentPage: 0,
  logs: [],
  forceStop: false
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'start':
        await startImport();
        res.status(200).json({ success: true, message: 'Import started' });
        break;
        
      case 'stop':
        stopImport();
        res.status(200).json({ success: true, message: 'Import stopped' });
        break;
        
      case 'resume':
        await resumeImport();
        res.status(200).json({ success: true, message: 'Import resumed' });
        break;
        
      case 'update':
        await updateExistingProducts();
        res.status(200).json({ success: true, message: 'Product update started' });
        break;
        
      case 'clear-products':
        await clearAllProducts();
        res.status(200).json({ success: true, message: 'All products cleared' });
        break;
        
      case 'clear-logs':
        clearLogs();
        res.status(200).json({ success: true, message: 'Logs cleared' });
        break;
        
      default:
        res.status(400).json({ success: false, message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Control action error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function startImport() {
  if (importState.isRunning) {
    throw new Error('Import is already running');
  }

  // Check if there's existing progress to resume from
  const statusResult = await query('SELECT current_page, status FROM kinguin_import_status ORDER BY id DESC LIMIT 1');
  const savedPage = statusResult.rows[0]?.current_page || 0;
  const lastStatus = statusResult.rows[0]?.status || 'Idle';
  
  // Start from saved page + 1 if we were previously stopped, otherwise start from page 1
  const startPage = (lastStatus === 'Stopped' && savedPage > 0) ? savedPage + 1 : 1;

  importState.isRunning = true;
  importState.forceStop = false;
  importState.currentPage = startPage;
  
  if (startPage > 1) {
    addLog(`Import started - Resuming from page ${startPage} (previous session stopped at page ${savedPage})`);
  } else {
    addLog('Import started from beginning');
  }

  // Update status in database
  await updateImportStatus({ status: 'Running', current_page: startPage });

  // Start the import process (non-blocking)
  processImport();
}

async function stopImport() {
  // Get the actual current page from database before stopping
  const statusResult = await query('SELECT current_page FROM kinguin_import_status ORDER BY id DESC LIMIT 1');
  const dbCurrentPage = statusResult.rows[0]?.current_page || importState.currentPage || 1;
  
  importState.isRunning = false;
  importState.forceStop = true;
  addLog('Import stopped by user - Force stop initiated');
  
  // Use the database page number as it's more reliable
  addLog(`Saving progress: Last page processed was ${dbCurrentPage}`);
  
  await updateImportStatus({ 
    status: 'Stopped',
    current_page: dbCurrentPage
  });
}

async function resumeImport() {
  if (importState.isRunning) {
    throw new Error('Import is already running');
  }

  // Get current page from database
  const statusResult = await query('SELECT current_page FROM kinguin_import_status ORDER BY id DESC LIMIT 1');
  const currentPage = statusResult.rows[0]?.current_page || 1;

  importState.isRunning = true;
  importState.forceStop = false;
  importState.currentPage = Math.max(currentPage, 1); // Ensure page is at least 1
  addLog('Import resumed from page ' + importState.currentPage);
  
  await updateImportStatus({ status: 'Running' });
  
  // Resume the import process
  processImport();
}

async function updateExistingProducts() {
  addLog('Updating existing products...');
  await updateImportStatus({ status: 'Updating' });
  
  // Simulate update process
  setTimeout(async () => {
    addLog('Product update completed');
    await updateImportStatus({ status: 'Idle' });
  }, 2000);
}

async function clearAllProducts() {
  try {
    // Clear all products from products table
    await query('DELETE FROM products');
    
    addLog('All Kinguin products cleared from database');
    
    // Reset import status
    await query(`
      UPDATE kinguin_import_status 
      SET total_products = 0, imported = 0, skipped = 0, errors = 0, current_page = 0, status = 'Idle', last_update = NOW()
    `);
    
    addLog('Import status reset');
  } catch (error) {
    addLog(`Error clearing products: ${error.message}`);
    throw error;
  }
}

function clearLogs() {
  importState.logs = [];
  console.log(new Date().toLocaleTimeString() + ' Logs cleared');
}

async function processImport() {
  try {
    // Get settings
    const settingsResult = await query('SELECT * FROM kinguin_settings ORDER BY id DESC LIMIT 1');
    
    if (settingsResult.rows.length === 0) {
      addLog('Error: No API settings found');
      return;
    }

    const settings = settingsResult.rows[0];
    
    if (!settings.api_key) {
      addLog('Error: API key not configured');
      await updateImportStatus({ status: 'Error' });
      return;
    }
    
    let page = importState.currentPage;
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const limit = 100; // Products per page

    while (importState.isRunning && !importState.forceStop) {
      // Check database status for immediate stop
      const statusCheck = await query('SELECT status FROM kinguin_import_status ORDER BY id DESC LIMIT 1');
      const dbStatus = statusCheck.rows[0]?.status;
      
      if (dbStatus === 'Stopped' || importState.forceStop) {
        addLog('Import stopped by user (database check)');
        importState.isRunning = false;
        break;
      }
      
      addLog(`Importing page ${page}...`);
      
      try {
        // Make API call to Kinguin using stored URL
        const baseUrl = settings.api_url || 'https://gateway.kinguin.net/esa/api/v1/products';
        const response = await fetch(`${baseUrl}?page=${page}&limit=${limit}&sortBy=name&sortType=asc`, {
          headers: {
            'X-Api-Key': settings.api_key,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Check for stop immediately after API call
        if (importState.forceStop) {
          addLog('Import stopped by user after API call');
          break;
        }
        
        if (!data.results || data.results.length === 0) {
          addLog('No more products to import');
          break;
        }

        // Process each product with filtering
        let productProcessingStopped = false;
        for (const product of data.results) {
          // Immediate check for force stop during product processing
          if (importState.forceStop) {
            addLog('Import stopped by user during product processing');
            productProcessingStopped = true;
            break;
          }
          
          try {
            // Check if product matches filter settings
            if (!isProductMatchingFilters(product, settings.platforms || [], settings.genres || [], settings.tags || [], settings.minimum_price || 0)) {
              skipped++;
              continue;
            }
            
            await insertKinguinProduct(product);
            imported++;
          } catch (insertError) {
            if (insertError.message.includes('duplicate key')) {
              skipped++;
            } else {
              errors++;
              addLog(`Error inserting product ${product.productId}: ${insertError.message}`);
            }
          }
        }
        
        // If product processing was stopped, break out of page loop too
        if (productProcessingStopped) {
          break;
        }
        
        // Final check before continuing to next page
        if (importState.forceStop) {
          addLog('Import stopped before next page');
          break;
        }
        
        addLog(`Page ${page}: ${data.results.length} products processed, ${imported} imported, ${skipped} skipped, ${errors} errors`);
        
        // Final stop check before database update
        if (importState.forceStop) {
          addLog('Import stopped by user before status update');
          break;
        }
        
        // Update status
        await updateImportStatus({
          current_page: page,
          imported: imported,
          skipped: skipped,
          errors: errors,
          total_products: data.item_count || 0
        });
        
        page++;
        importState.currentPage = page;
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        errors++;
        addLog(`Error on page ${page}: ${error.message}`);
        
        // If it's an authentication error or 404, stop the import
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) {
          addLog('API request failed. Please check your API key and settings.');
          importState.isRunning = false;
          break;
        }
      }
    }

    if (importState.isRunning) {
      addLog(`Import completed: ${imported} imported, ${skipped} skipped, ${errors} errors`);
      await updateImportStatus({ status: 'Completed' });
    }
    
    importState.isRunning = false;
    
  } catch (error) {
    addLog(`Import error: ${error.message}`);
    importState.isRunning = false;
    await updateImportStatus({ status: 'Error' });
  }
}

// Helper function to safely handle JSON data for PostgreSQL JSONB fields with stringified output
function safeJsonValue(value, fallback = {}) {
  if (value === null || value === undefined) {
    return JSON.stringify(fallback);
  }
  
  // If it's already an object or array, validate and stringify it
  if (typeof value === 'object') {
    try {
      const sanitized = sanitizeForDatabase(value);
      return JSON.stringify(sanitized);
    } catch (e) {
      console.log('Invalid object detected, using fallback:', e.message);
      return JSON.stringify(fallback);
    }
  }
  
  // If it's a string, try to parse and re-stringify it
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === '[]' || trimmed === '{}' || trimmed === 'null') {
      return JSON.stringify(fallback);
    }
    try {
      const parsed = JSON.parse(trimmed);
      const sanitized = sanitizeForDatabase(parsed);
      return JSON.stringify(sanitized);
    } catch (e) {
      console.log('Invalid JSON string detected, using fallback:', e.message);
      return JSON.stringify(fallback);
    }
  }
  
  // For other types (numbers, booleans), wrap in simple object and stringify
  if (typeof value === 'number' || typeof value === 'boolean') {
    return JSON.stringify({ value: value });
  }
  
  return JSON.stringify(fallback);
}

// Function to deeply sanitize data for PostgreSQL JSONB compatibility
function sanitizeForDatabase(data) {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (typeof data === 'string') {
    // Remove any problematic characters that could break JSON parsing
    return data.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeForDatabase(item)).filter(item => item !== null);
    } else {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        const cleanKey = key.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        const cleanValue = sanitizeForDatabase(value);
        if (cleanValue !== null && cleanKey) {
          sanitized[cleanKey] = cleanValue;
        }
      }
      return sanitized;
    }
  }
  
  return data;
}

async function insertKinguinProduct(product) {
  // Sanitize the entire product object first
  const sanitizedProduct = sanitizeForDatabase(product);
  
  // Extract image URLs from actual Kinguin API structure
  let coverUrl = '';
  let coverThumbnail = '';
  let screenshotUrl = '';
  let screenshotThumbnail = '';
  let allScreenshots = []; // Array to store ALL screenshots
  
  // Check different possible image structures from Kinguin API
  if (sanitizedProduct.images) {
    if (Array.isArray(sanitizedProduct.images)) {
      // If images is an array, get first image
      const firstImage = sanitizedProduct.images[0];
      if (firstImage) {
        coverUrl = firstImage.url || firstImage.image || '';
        coverThumbnail = firstImage.thumbnail || firstImage.thumb || '';
      }
    } else if (typeof sanitizedProduct.images === 'object') {
      // If images is an object with cover/screenshots
      if (sanitizedProduct.images.cover) {
        if (Array.isArray(sanitizedProduct.images.cover)) {
          coverUrl = sanitizedProduct.images.cover[0]?.url || '';
          coverThumbnail = sanitizedProduct.images.cover[0]?.thumbnail || '';
        } else {
          coverUrl = sanitizedProduct.images.cover.url || sanitizedProduct.images.cover;
          coverThumbnail = sanitizedProduct.images.cover.thumbnail || '';
        }
      }
      if (sanitizedProduct.images.screenshots && Array.isArray(sanitizedProduct.images.screenshots)) {
        // Extract ALL screenshots and format as JSONB objects for PostgreSQL
        const screenshotUrls = sanitizedProduct.images.screenshots
          .map(screenshot => screenshot?.url || screenshot)
          .filter(url => url && typeof url === 'string' && url.trim() !== '');
        
        // Format as JSONB objects for the jsonb[] database field
        allScreenshots = screenshotUrls.map(url => ({ url: url }));
        
        // Log the number of screenshots found for debugging
        if (allScreenshots.length > 1) {
          console.log(`[IMPORT] Product ${sanitizedProduct.name} has ${allScreenshots.length} screenshots`);
        }
        
        // Keep backward compatibility for single screenshot fields
        screenshotUrl = screenshotUrls[0] || '';
        screenshotThumbnail = sanitizedProduct.images.screenshots[0]?.thumbnail || '';
      }
    }
  }
  
  // Fallback to other possible image fields
  if (!coverUrl && sanitizedProduct.image) coverUrl = sanitizedProduct.image;
  if (!coverUrl && sanitizedProduct.imageUrl) coverUrl = sanitizedProduct.imageUrl;
  if (!coverThumbnail && sanitizedProduct.thumbnail) coverThumbnail = sanitizedProduct.thumbnail;

  // Format the product description using the auto-formatting script
  const formattedDescription = formatDescription(sanitizedProduct.description || '', sanitizedProduct.name);

  // Calculate commission tier and final price using fresh pricing logic
  const kinguinPrice = parseFloat(sanitizedProduct.price) || 0;
  
  // Use the pricing logic to calculate commission tier and final price
  const pricingResult = calculateProductPrice({
    kinguin_price: kinguinPrice,
    kinguinid: sanitizedProduct.kinguinId,
    productid: sanitizedProduct.productId
  });
  
  const commissionTierId = pricingResult.commission_tier_id;
  const finalPrice = pricingResult.price;

  const insertQuery = `
    INSERT INTO products (
      kinguinId, productId, cheapestOfferId, name, originalName, description,
      developers, publishers, genres, platform, releaseDate, qty, kinguin_price, price, textQty,
      offers, offersCount, totalQty, isPreorder, metacriticScore,
      regionalLimitations, countryLimitation, regionId, activationDetails,
      videos, languages, updatedAt, systemRequirements, tags, merchantName,
      ageRating, steam, images, images_cover_url, images_cover_thumbnail, 
      images_screenshots, images_screenshots_url, images_screenshots_thumbnail, commission_tier_id,
      shipping_time_value, shipping_time_unit
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
    )
    ON CONFLICT (productId) DO UPDATE SET
      name = EXCLUDED.name,
      kinguin_price = EXCLUDED.kinguin_price,
      price = EXCLUDED.price,
      commission_tier_id = EXCLUDED.commission_tier_id,
      qty = EXCLUDED.qty,
      updatedAt = EXCLUDED.updatedAt,
      images_cover_url = EXCLUDED.images_cover_url,
      images_cover_thumbnail = EXCLUDED.images_cover_thumbnail,
      images_screenshots = EXCLUDED.images_screenshots,
      images_screenshots_url = EXCLUDED.images_screenshots_url,
      images_screenshots_thumbnail = EXCLUDED.images_screenshots_thumbnail,
      shipping_time_value = EXCLUDED.shipping_time_value,
      shipping_time_unit = EXCLUDED.shipping_time_unit
  `;

  const values = [
    sanitizedProduct.kinguinId || null,
    sanitizedProduct.productId,
    Array.isArray(sanitizedProduct.cheapestOfferId) ? sanitizedProduct.cheapestOfferId : (sanitizedProduct.cheapestOfferId ? [sanitizedProduct.cheapestOfferId] : []),
    sanitizedProduct.name || '',
    sanitizedProduct.originalName || '',
    formattedDescription,
    Array.isArray(sanitizedProduct.developers) ? sanitizedProduct.developers : (sanitizedProduct.developers ? [sanitizedProduct.developers] : []),
    Array.isArray(sanitizedProduct.publishers) ? sanitizedProduct.publishers : (sanitizedProduct.publishers ? [sanitizedProduct.publishers] : []),
    Array.isArray(sanitizedProduct.genres) ? sanitizedProduct.genres : (sanitizedProduct.genres ? [sanitizedProduct.genres] : []),
    sanitizedProduct.platform || '',
    sanitizedProduct.releaseDate || '',
    sanitizedProduct.qty || 0,
    sanitizedProduct.price || 0,  // kinguin_price
    finalPrice,                    // calculated price
    sanitizedProduct.textQty || 0,
    sanitizedProduct.offers ? JSON.stringify(sanitizedProduct.offers) : '[]',
    sanitizedProduct.offersCount || 0,
    sanitizedProduct.totalQty || 0,
    sanitizedProduct.isPreorder || false,
    sanitizedProduct.metacriticScore || null,
    sanitizedProduct.regionalLimitations || '',
    Array.isArray(sanitizedProduct.countryLimitation) ? sanitizedProduct.countryLimitation : (sanitizedProduct.countryLimitation ? [sanitizedProduct.countryLimitation] : []),
    sanitizedProduct.regionId || null,
    sanitizedProduct.activationDetails || '',
    sanitizedProduct.videos ? JSON.stringify(sanitizedProduct.videos) : '[]',
    Array.isArray(sanitizedProduct.languages) ? sanitizedProduct.languages : (sanitizedProduct.languages ? [sanitizedProduct.languages] : []),
    sanitizedProduct.updatedAt || new Date().toISOString(),
    sanitizedProduct.systemRequirements ? JSON.stringify(sanitizedProduct.systemRequirements) : '{}',
    Array.isArray(sanitizedProduct.tags) ? sanitizedProduct.tags : (sanitizedProduct.tags ? [sanitizedProduct.tags] : []),
    Array.isArray(sanitizedProduct.merchantName) ? sanitizedProduct.merchantName : (sanitizedProduct.merchantName ? [sanitizedProduct.merchantName] : []),
    sanitizedProduct.ageRating || '',
    sanitizedProduct.steam || '',
    sanitizedProduct.images ? JSON.stringify(sanitizedProduct.images) : '{}',
    coverUrl,
    coverThumbnail,
    allScreenshots.length > 0 ? allScreenshots : null, // JSONB array for PostgreSQL
    screenshotUrl,
    screenshotThumbnail,
    commissionTierId,
    '0',                          // shipping_time_value (default to 0 for Instant Delivery)
    'Instant Delivery'            // shipping_time_unit (default for all Kinguin products)
  ];

  await query(insertQuery, values);
}

async function updateImportStatus(updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (fields.length > 0) {
      fields.push(`last_update = NOW()`);
      
      const updateQuery = `
        UPDATE kinguin_import_status 
        SET ${fields.join(', ')}
        WHERE id = (SELECT id FROM kinguin_import_status ORDER BY id DESC LIMIT 1)
      `;
      
      await query(updateQuery, values);
    }
  } catch (error) {
    console.error('Error updating import status:', error);
  }
}

function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `${timestamp} ${message}`;
  
  importState.logs.unshift(logEntry);
  
  // Keep only last 50 logs
  if (importState.logs.length > 50) {
    importState.logs = importState.logs.slice(0, 50);
  }
  
  console.log(logEntry);
}

function isProductMatchingFilters(product, platforms, genres, tags, minimumPrice) {
  // Check platform filter (if not empty)
  if (platforms.length > 0 && !platforms.includes(product.platform)) {
    return false;
  }
  
  // Check genres filter (if not empty)
  if (genres.length > 0 && !product.genres.some(genre => genres.includes(genre))) {
    return false;
  }
  
  // Check tags filter (if not empty)
  if (tags.length > 0 && !product.tags.some(tag => tags.includes(tag))) {
    return false;
  }

  // Check minimum price
  if (product.price < minimumPrice) {
    return false;
  }

  return true;
}

// Export logs endpoint
export { importState };