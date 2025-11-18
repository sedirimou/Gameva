import { query } from '../../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Fetch order details for confirmation (no auth required)
    let orderResult;
    
    // Try to match by order_id first (like GM1751232653571)
    if (orderId.startsWith('GM')) {
      orderResult = await query(
        `SELECT * FROM orders WHERE order_id = $1`,
        [orderId]
      );
    } else if (!isNaN(orderId)) {
      // Numeric ID
      orderResult = await query(
        `SELECT * FROM orders WHERE id = $1`,
        [parseInt(orderId)]
      );
    } else {
      // Try payment intent ID
      orderResult = await query(
        `SELECT * FROM orders WHERE stripe_payment_intent_id = $1`,
        [orderId]
      );
    }

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Parse JSON fields
    const parsedOrder = {
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      customer_address: typeof order.customer_address === 'string' 
        ? JSON.parse(order.customer_address) 
        : order.customer_address
    };

    console.log('Order confirmation fetched:', parsedOrder.order_id);
    res.json(parsedOrder);

  } catch (error) {
    console.error('Error fetching order for confirmation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}