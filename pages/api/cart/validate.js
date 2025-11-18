import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, requestedQuantity, currentCartQuantity = 0 } = req.body;

  if (!productId || !requestedQuantity) {
    return res.status(400).json({ error: 'Product ID and requested quantity are required' });
  }

  try {
    // Fetch product with limit_per_basket
    const result = await query(
      'SELECT id, name, limit_per_basket FROM products WHERE id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    const limitPerBasket = product.limit_per_basket;

    // If no limit is set, allow any quantity
    if (!limitPerBasket || limitPerBasket <= 0) {
      return res.status(200).json({ 
        valid: true, 
        allowed: true,
        message: 'No limit restrictions'
      });
    }

    // Check if requested quantity exceeds limit
    const totalQuantity = currentCartQuantity + requestedQuantity;
    
    if (totalQuantity > limitPerBasket) {
      const availableSlots = limitPerBasket - currentCartQuantity;
      
      return res.status(400).json({
        valid: false,
        allowed: false,
        limit: limitPerBasket,
        current: currentCartQuantity,
        requested: requestedQuantity,
        available: Math.max(0, availableSlots),
        message: availableSlots <= 0 
          ? `You can only add up to ${limitPerBasket} unit${limitPerBasket > 1 ? 's' : ''} of "${product.name}" to your cart.`
          : `Only ${availableSlots} more unit${availableSlots > 1 ? 's' : ''} of "${product.name}" can be added to your cart.`
      });
    }

    // Valid quantity within limits
    return res.status(200).json({
      valid: true,
      allowed: true,
      limit: limitPerBasket,
      current: currentCartQuantity,
      requested: requestedQuantity,
      message: 'Quantity is within allowed limits'
    });

  } catch (error) {
    console.error('Cart validation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}