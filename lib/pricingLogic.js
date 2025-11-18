/**
 * Pricing Logic for Commission System (Fresh Implementation)
 * Handles pricing logic for Kinguin products vs manually created products
 * Works with actual kinguin_commission_tiers database structure
 */

/**
 * Get commission information from tier ID
 * @param {number} tierId - Commission tier ID
 * @returns {Object} Commission info with type and rate
 */
export function getCommissionInfo(tierId) {
  // Database commission tiers mapping (updated IDs)
  const commissionTiers = {
    205: { type: 'Fixed', rate: 2.00 },   // €0.01-€4.99: Fixed €2.00
    206: { type: 'Fixed', rate: 4.00 },   // €5.00-€9.99: Fixed €4.00  
    207: { type: 'Fixed', rate: 5.00 },   // €10.00-€19.99: Fixed €5.00
    208: { type: 'Percent', rate: 20.00 } // €20.00+: 20% percentage
  };

  return commissionTiers[tierId] || { type: 'Fixed', rate: 4.00 };
}

/**
 * Get commission tier based on price range
 * @param {number} price - Base price
 * @returns {number} Commission tier ID
 */
export function getCommissionTier(price) {
  console.log('🔍 getCommissionTier called with price:', price);
  
  if (price < 5.00) {
    console.log('✅ Tier 205: €2.00 fixed commission (€0.01-€4.99)');
    return 205;
  }
  if (price < 10.00) {
    console.log('✅ Tier 206: €4.00 fixed commission (€5.00-€9.99)');
    return 206;
  }
  if (price < 20.00) {
    console.log('✅ Tier 207: €5.00 fixed commission (€10.00-€19.99)');
    return 207;
  }
  
  console.log('✅ Tier 208: 20% percentage commission (€20.00+)');
  return 208;
}

/**
 * Determine if product is from Kinguin based on various indicators
 * @param {Object} productData - Product data
 * @returns {boolean} True if Kinguin product
 */
export function isKinguinProduct(productData) {
  const { kinguinid, productid, kinguin_price } = productData;
  
  // Explicit Kinguin indicators
  if (kinguinid && kinguinid !== null) return true;
  
  // Manual product indicators (GV prefix)
  if (productid && productid.startsWith('GV')) return false;
  
  // Has Kinguin price but no manual indicators
  if (kinguin_price && kinguin_price > 0) return true;
  
  // Default to manual product
  return false;
}

/**
 * Calculate the final customer price based on product type and commission tiers
 * @param {Object} productData - Product data object
 * @returns {Object} Pricing calculation result
 */
export function calculateProductPrice(productData) {
  const { 
    price: enteredPrice, 
    kinguin_price: kinguinPrice, 
    kinguinid: kinguinId,
    productid: productId 
  } = productData;

  console.log('💰 calculateProductPrice called with:', {
    enteredPrice,
    kinguinPrice,
    kinguinId,
    productId
  });

  let finalPrice;
  let kinguin_price = null;
  let calculation_type;
  let commission_tier_id;
  let commission_applied = 0;

  // Determine if this is a Kinguin product
  const isKinguin = isKinguinProduct(productData);
  console.log('🏷️ isKinguinProduct:', isKinguin);

  if (isKinguin) {
    // KINGUIN PRODUCTS: Apply commission system
    const basePrice = kinguinPrice || enteredPrice;
    
    // Get appropriate commission tier based on price
    commission_tier_id = getCommissionTier(basePrice);
    
    // Get commission rate from tier mapping
    const commissionInfo = getCommissionInfo(commission_tier_id);
    
    console.log(`🎯 Kinguin product calculation:`, {
      basePrice,
      commission_tier_id,
      commissionInfo
    });
    
    if (commissionInfo.type === 'Percent') {
      // Percentage-based commission
      finalPrice = basePrice * (1 + commissionInfo.rate / 100);
      calculation_type = 'kinguin_percentage';
      commission_applied = basePrice * (commissionInfo.rate / 100);
      console.log(`📈 Percentage: €${basePrice} × (1 + ${commissionInfo.rate}%) = €${finalPrice.toFixed(2)}`);
    } else {
      // Fixed commission
      finalPrice = basePrice + commissionInfo.rate;
      calculation_type = 'kinguin_fixed';
      commission_applied = commissionInfo.rate;
      console.log(`📊 Fixed: €${basePrice} + €${commissionInfo.rate} = €${finalPrice.toFixed(2)}`);
    }
    
    kinguin_price = basePrice;
  } else {
    // MANUALLY CREATED PRODUCTS: Keep exact entered price
    finalPrice = enteredPrice || 0; // Default to 0 if undefined
    kinguin_price = null;
    calculation_type = 'manual_direct';
    commission_tier_id = null;
    console.log(`✋ Manual product: keeping entered price €${finalPrice}`);
  }

  // Ensure finalPrice is a valid number
  if (finalPrice === undefined || finalPrice === null || isNaN(finalPrice)) {
    console.warn('⚠️  finalPrice is invalid, defaulting to 0');
    finalPrice = 0;
  }

  // Ensure commission_applied is a valid number
  if (commission_applied === undefined || commission_applied === null || isNaN(commission_applied)) {
    commission_applied = 0;
  }

  const result = {
    price: parseFloat(Number(finalPrice).toFixed(2)),
    kinguin_price,
    calculation_type,
    commission_tier_id,
    commission_applied: parseFloat(Number(commission_applied).toFixed(2))
  };

  console.log('💰 Final calculation result:', result);
  return result;
}