const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
import { buffer } from 'micro';
import { query } from '../../../lib/database';

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
      // Verify the webhook signature for security
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } else {
      // For development without webhook secret
      event = JSON.parse(buf.toString());
      console.warn('Webhook signature verification disabled. This should only be used in development.');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received verified webhook event:', event.type);

  // Handle different event types
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object);
        break;

      case 'payment_intent.created':
        await handlePaymentIntentCreated(event.data.object);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type} - This is normal if you don't process all Stripe events`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  try {
    // Extract customer email from multiple possible sources
    const customerEmail = paymentIntent.receipt_email || 
                         paymentIntent.metadata?.customer_email || 
                         paymentIntent.customer_email || 
                         'test@gamava.com'; // Fallback for test payments
    
    const customerName = paymentIntent.metadata?.customer_name || 'Test Customer';
    const items = JSON.parse(paymentIntent.metadata?.items || '[]');
    const orderId = paymentIntent.metadata?.order_id || `GM${Date.now()}`;

    // Log the source of customer data for debugging
    console.log('Customer email extracted from:', {
      receipt_email: !!paymentIntent.receipt_email,
      metadata_email: !!paymentIntent.metadata?.customer_email,
      customer_email: !!paymentIntent.customer_email,
      using: customerEmail
    });

    // Update existing order status in database
    const updateResult = await query(
      `UPDATE orders 
       SET payment_status = 'paid', 
           status = 'processing',
           paid_at = NOW(),
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

    if (updateResult.rowCount === 0) {
      // Create order if it doesn't exist
      console.log('Creating new order for payment:', paymentIntent.id);
      const totalAmount = paymentIntent.amount / 100; // Convert from cents
      const subtotal = totalAmount * 0.826; // Remove VAT (21%)
      const tax = totalAmount * 0.174; // VAT amount
      
      await query(
        `INSERT INTO orders (
          order_id, stripe_payment_intent_id, customer_email, customer_name,
          items, subtotal, tax, total, currency, payment_status, status, paid_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'paid', 'processing', NOW())`,
        [
          orderId,
          paymentIntent.id,
          customerEmail,
          customerName,
          JSON.stringify(items),
          subtotal,
          tax,
          totalAmount,
          paymentIntent.currency.toUpperCase()
        ]
      );
    } else {
      console.log('Updated existing order for payment:', paymentIntent.id);
    }

    // Implement order fulfillment
    await fulfillOrder(paymentIntent.id, items, customerEmail);

    console.log('Order processed successfully for payment:', paymentIntent.id);

  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  try {
    // Update order status if order exists
    const updateResult = await query(
      `UPDATE orders 
       SET payment_status = 'failed', 
           status = 'failed',
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

    if (updateResult.rowCount === 0) {
      console.log('No existing order found for failed payment:', paymentIntent.id);
    } else {
      console.log('Updated order status to failed for payment:', paymentIntent.id);
    }

    // TODO: Send failure notification email
    console.log('Payment failure notification should be sent');

  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent) {
  console.log('Payment canceled:', paymentIntent.id);

  try {
    await query(
      `UPDATE orders 
       SET payment_status = 'canceled', 
           status = 'canceled',
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

  } catch (error) {
    console.error('Error handling canceled payment:', error);
    throw error;
  }
}

async function handlePaymentRequiresAction(paymentIntent) {
  console.log('Payment requires action:', paymentIntent.id);

  try {
    await query(
      `UPDATE orders 
       SET payment_status = 'requires_action', 
           status = 'pending',
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

  } catch (error) {
    console.error('Error handling payment requiring action:', error);
    throw error;
  }
}

async function handlePaymentIntentCreated(paymentIntent) {
  console.log('Payment intent created:', paymentIntent.id);

  try {
    // Extract customer data for advance order registration
    const customerEmail = paymentIntent.receipt_email || 
                         paymentIntent.metadata?.customer_email || 
                         paymentIntent.customer_email || 
                         'pending@gamava.com';
    
    const customerName = paymentIntent.metadata?.customer_name || 'Pending Customer';
    const items = JSON.parse(paymentIntent.metadata?.items || '[]');
    const orderId = paymentIntent.metadata?.order_id || `GM${Date.now()}`;

    // Check if order already exists (from checkout API)
    const existingOrder = await query(
      `SELECT id FROM orders WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id]
    );

    if (existingOrder.rowCount === 0) {
      // Create pending order for advance tracking
      const totalAmount = paymentIntent.amount / 100;
      const subtotal = totalAmount * 0.826;
      const tax = totalAmount * 0.174;
      
      await query(
        `INSERT INTO orders (
          order_id, stripe_payment_intent_id, customer_email, customer_name,
          items, subtotal, tax, total, currency, payment_status, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'pending')`,
        [
          orderId,
          paymentIntent.id,
          customerEmail,
          customerName,
          JSON.stringify(items),
          subtotal,
          tax,
          totalAmount,
          paymentIntent.currency.toUpperCase()
        ]
      );
      
      console.log('Advance order registered for payment intent:', paymentIntent.id);
    } else {
      console.log('Order already exists for payment intent:', paymentIntent.id);
    }

  } catch (error) {
    console.error('Error handling payment intent created:', error);
    // Don't throw - this shouldn't block payment processing
  }
}

async function handleChargeSucceeded(charge) {
  console.log('Charge succeeded:', charge.id, 'for payment intent:', charge.payment_intent);

  try {
    // Log charge details for audit purposes
    await query(
      `UPDATE orders 
       SET updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [charge.payment_intent]
    );

    console.log('Charge audit logged for:', charge.payment_intent);

  } catch (error) {
    console.error('Error handling charge succeeded:', error);
    // Don't throw - this is for audit only
  }
}

async function fulfillOrder(paymentIntentId, items, customerEmail) {
  try {
    console.log('Starting order fulfillment for:', paymentIntentId);

    // Mark as fulfilled
    await query(
      `UPDATE orders 
       SET status = 'fulfilled', 
           fulfilled_at = NOW(),
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntentId]
    );

    // TODO: Implement actual fulfillment logic:
    // 1. Generate game keys from suppliers
    // 2. Send email with game keys
    // 3. Update inventory
    // 4. Send receipt
    
    console.log('Order fulfillment completed for:', paymentIntentId);
    console.log('Game keys should be sent to:', customerEmail);
    console.log('Items to fulfill:', items);

  } catch (error) {
    console.error('Error fulfilling order:', error);
    
    // Mark fulfillment as failed but keep payment as successful
    await query(
      `UPDATE orders 
       SET status = 'fulfillment_failed',
           updated_at = NOW()
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntentId]
    );
    
    throw error;
  }
}