import { query } from '../../../../../lib/database.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First, check if the product exists and has a Kinguin ID
    const productQuery = `
      SELECT id, kinguinid, name
      FROM products 
      WHERE id = $1
    `;
    
    const productResult = await query(productQuery, [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false 
      });
    }

    const product = productResult.rows[0];
    
    // Check if this is a Kinguin product
    if (!product.kinguinid) {
      return res.status(400).json({ 
        error: 'This product is not a Kinguin product. Only Kinguin products can have their data reloaded.',
        success: false 
      });
    }

    // Get Kinguin API settings
    const settingsQuery = `
      SELECT api_key
      FROM kinguin_settings 
      WHERE id = 1
    `;
    
    const settingsResult = await query(settingsQuery);
    
    if (settingsResult.rows.length === 0) {
      return res.status(500).json({ 
        error: 'Kinguin API settings not configured. Please configure Kinguin API settings first.',
        success: false 
      });
    }

    const apiKey = settingsResult.rows[0].api_key;

    // Fetch fresh data from Kinguin API
    const kinguinResponse = await fetch(`https://gateway.kinguin.net/esa/api/v1/products/${product.kinguinid}`, {
      headers: {
        'X-Api-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!kinguinResponse.ok) {
      return res.status(500).json({ 
        error: `Failed to fetch data from Kinguin API: ${kinguinResponse.status} ${kinguinResponse.statusText}`,
        success: false 
      });
    }

    const kinguinData = await kinguinResponse.json();

    // Extract the updated data we need
    const updatedPrice = kinguinData.price?.amount || product.price;
    const updatedKinguinPrice = kinguinData.originalPrice?.amount || kinguinData.price?.amount;
    const updatedProductId = kinguinData.productId || product.kinguinid;
    
    // Extract regions from Kinguin data
    let updatedRegions = [];
    if (kinguinData.regions && Array.isArray(kinguinData.regions)) {
      // Map Kinguin region codes to our region IDs
      const regionMapping = {
        'GLOBAL': 1,
        'EUROPE': 2, 
        'UNITED_STATES': 3,
        'UNITED_KINGDOM': 4,
        'ASIA': 5,
        'LATIN_AMERICA': 6,
        'CANADA': 7,
        'ARGENTINA': 8
      };
      
      updatedRegions = kinguinData.regions
        .map(region => regionMapping[region])
        .filter(regionId => regionId !== undefined);
    }

    // Update the product in database
    const updateQuery = `
      UPDATE products 
      SET 
        price = $1,
        kinguin_price = $2,
        kinguinid = $3,
        updatedat = CURRENT_TIMESTAMP
      WHERE id = $4
    `;

    await query(updateQuery, [
      updatedPrice,
      updatedKinguinPrice,
      updatedProductId,
      id
    ]);

    // Update regions in product_regions table
    if (updatedRegions.length > 0) {
      // Delete existing regions
      await query('DELETE FROM product_regions WHERE product_id = $1', [id]);
      
      // Insert updated regions
      const regionValues = updatedRegions.map(regionId => `(${id}, ${regionId})`).join(',');
      await query(`
        INSERT INTO product_regions (product_id, region_id) 
        VALUES ${regionValues}
      `);
    }

    res.status(200).json({
      success: true,
      message: 'Kinguin data reloaded successfully',
      data: {
        price: updatedPrice,
        kinguin_price: updatedKinguinPrice,
        product_id: updatedProductId,
        regions: updatedRegions,
        product_name: product.name
      }
    });

  } catch (error) {
    console.error('Reload Kinguin data error:', error);
    res.status(500).json({ 
      error: 'Internal server error while reloading Kinguin data',
      success: false 
    });
  }
}