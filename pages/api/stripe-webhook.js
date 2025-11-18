const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } else {
      event = JSON.parse(buf.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Here you would typically:
      // 1. Update your database with the successful payment
      // 2. Send confirmation emails
      // 3. Fulfill the order (send game keys, etc.)
      // 4. Update inventory
      
      try {
        // Example: Log the successful payment with metadata
        const customerEmail = paymentIntent.metadata.customer_email;
        const items = JSON.parse(paymentIntent.metadata.items || '[]');
        
        console.log('Order fulfilled for:', customerEmail);
        console.log('Items purchased:', items);
        
        // Add your order fulfillment logic here
        
      } catch (fulfillmentError) {
        console.error('Error fulfilling order:', fulfillmentError);
        // You might want to add this to a retry queue
      }
      
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Handle failed payment (e.g., notify customer, log for analysis)
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}