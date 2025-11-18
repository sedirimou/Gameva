import { query } from '../../../lib/database';
import { getAuthenticatedUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get authenticated user
    const user = await getAuthenticatedUser(req);
    console.log('Order API - Authenticated user:', user ? user.id : 'None');
    
    if (!user) {
      console.log('Order API - No authenticated user, returning 401');
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Fetch order details from database
    // Try to match by different fields based on the orderId format
    let orderResult;
    
    // If orderId is numeric, search by id
    if (!isNaN(orderId)) {
      orderResult = await query(
        `SELECT o.* FROM orders o WHERE o.id = $1`,
        [parseInt(orderId)]
      );
    } else {
      // If orderId is string, search by order_id or payment_intent_id
      orderResult = await query(
        `SELECT o.* FROM orders o 
         WHERE o.order_id = $1 OR o.stripe_payment_intent_id = $1`,
        [orderId]
      );
    }

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // For demo purposes, we'll allow viewing orders without strict user checking
    // In production, you would check if order.user_id === user.id

    // Parse items from JSONB field
    let items = [];
    try {
      items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
    } catch (e) {
      console.error('Error parsing order items:', e);
      items = [];
    }

    // Enrich items with product data if we have product IDs
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        if (item.id) {
          try {
            const productResult = await query(
              `SELECT name, platform, images_cover_url, productid as slug, price, sale_price
               FROM products WHERE id = $1`,
              [item.id]
            );
            
            if (productResult.rows.length > 0) {
              const product = productResult.rows[0];
              // Calculate selling price (use sale_price if exists, otherwise use price)
              const sellingPrice = product.sale_price ? parseFloat(product.sale_price) : parseFloat(product.price);
              
              return {
                ...item,
                name: item.name || product.name,
                sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
                platform: item.platform || product.platform,
                cover_url: product.images_cover_url,
                slug: product.slug,
                sellingPrice: sellingPrice || item.price || 0,
                originalPrice: parseFloat(product.price) || 0,
                sale_price: product.sale_price ? parseFloat(product.sale_price) : null
              };
            }
          } catch (e) {
            console.error('Error fetching product data:', e);
          }
        }
        return item;
      })
    );

    // Calculate selling price total from items
    const sellingPriceTotal = enrichedItems.reduce((total, item) => {
      const itemPrice = item.sale_price ? parseFloat(item.sale_price) : parseFloat(item.price || item.sellingPrice || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (itemPrice * quantity);
    }, 0);

    // Format the response
    const orderData = {
      id: order.id,
      payment_intent_id: order.stripe_payment_intent_id,
      order_id: order.order_id,
      total: parseFloat(order.total || 0),
      sellingPrice: sellingPriceTotal, // Add calculated selling price total
      subtotal: parseFloat(order.subtotal || 0),
      tax: parseFloat(order.tax || 0),
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      completed_at: order.fulfilled_at,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      payment_method: 'Credit or Debit Card',
      service_fee: 0,
      promo_amount: 0,
      product_key: 'DEMO-KEY-' + orderId,
      items: enrichedItems
    };

    res.status(200).json(orderData);

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
}