import { query } from '../../../lib/database';
import { calculateProductPrice } from '../../../lib/pricingLogic';

/**
 * Bulk Price Update API - Recalculates prices for all products with commission changes
 * Handles both Kinguin products (with commission) and manual products (preserves exact price)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting bulk price update for all products...');

    // Get all products that need price calculation
    const productsResult = await query(`
      SELECT 
        id, 
        kinguin_price, 
        price,
        kinguinid,
        productid,
        name,
        commission_tier_id
      FROM products 
      WHERE kinguin_price IS NOT NULL 
        AND kinguin_price > 0
      ORDER BY id
    `);

    const products = productsResult.rows;
    console.log(`📊 Found ${products.length} Kinguin products to update`);

    let updatedCount = 0;
    let errors = [];

    // Process products in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);

      for (const product of batch) {
        try {
          // Use fresh pricing logic to calculate correct price and commission tier
          const pricingResult = calculateProductPrice({
            kinguin_price: parseFloat(product.kinguin_price),
            kinguinid: product.kinguinid,
            productid: product.productid,
            price: parseFloat(product.price)
          });

          console.log(`💰 Product ${product.id} (${product.name}): €${product.kinguin_price} → €${pricingResult.price} (Tier: ${pricingResult.commission_tier_id})`);

          // Update the product with new price and commission tier
          await query(`
            UPDATE products 
            SET 
              price = $1,
              commission_tier_id = $2,
              updatedat = CURRENT_TIMESTAMP
            WHERE id = $3
          `, [
            pricingResult.price,
            pricingResult.commission_tier_id,
            product.id
          ]);

          updatedCount++;
        } catch (error) {
          console.error(`❌ Error updating product ${product.id}:`, error);
          errors.push({
            productId: product.id,
            productName: product.name,
            error: error.message
          });
        }
      }
    }

    console.log(`✅ Bulk price update completed: ${updatedCount} products updated, ${errors.length} errors`);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} products`,
      data: {
        totalProducts: products.length,
        updatedCount,
        errorCount: errors.length,
        errors: errors.slice(0, 10) // Return first 10 errors only
      }
    });

  } catch (error) {
    console.error('❌ Bulk price update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product prices',
      error: error.message
    });
  }
}