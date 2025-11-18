import { getStripeServer, validateStripeConfig } from '../../lib/stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate Stripe configuration
  const stripeValidation = validateStripeConfig();
  if (!stripeValidation.isValid) {
    console.error('Stripe configuration errors:', stripeValidation.errors);
    return res.status(500).json({ 
      message: 'Stripe configuration error',
      errors: stripeValidation.errors 
    });
  }

  const stripe = getStripeServer();

  try {
    const { amount, currency = 'eur', items = [], customerInfo = {} } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Validate currency - Only EUR supported
    const validCurrency = currency.toLowerCase();
    
    if (validCurrency !== 'eur') {
      return res.status(400).json({ 
        message: 'Only EUR currency is supported',
        supportedCurrency: 'eur' 
      });
    }

    // Convert amount to cents for Stripe (handle zero-decimal currencies like JPY)
    const zeroDecimalCurrencies = ['jpy', 'krw'];
    const amountInCents = zeroDecimalCurrencies.includes(validCurrency) 
      ? Math.round(amount) 
      : Math.round(amount * 100);

    // Generate order ID
    const orderId = `GM${Date.now()}`;

    // Only EUR is supported, use European payment methods matching the design
    const getPaymentMethodsForCurrency = (currency) => {
      // EUR supports all European payment methods from the design
      return [
        'card',           // Card payments (Visa, Mastercard, etc.)
        'sepa_debit',     // SEPA Debit 
        'ideal',          // iDEAL (Netherlands)
        'bancontact',     // Bancontact (Belgium)
        'sofort',         // Sofort (Germany, Austria)
        'giropay',        // Giropay (Germany)
        'eps',            // EPS (Austria)
        'p24'             // Przelewy24 (Poland)
      ];
    };

    // Create payment intent with automatic payment methods for comprehensive coverage
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: validCurrency,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      metadata: {
        order_id: orderId,
        item_count: items.length.toString(),
        total_items: items.reduce((sum, item) => sum + (item.quantity || 1), 0).toString(),
        customer_name: (customerInfo.name || `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`).substring(0, 100),
        customer_email: (customerInfo.email || '').substring(0, 100),
      },
    });

    // Create order record in database
    try {
      const { query } = await import('../../lib/database.js');
      await query(
        `INSERT INTO orders (
          order_id, stripe_payment_intent_id, customer_email, customer_name,
          customer_address, items, subtotal, tax, total, currency, status, payment_status,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'pending', NOW(), NOW())`,
        [
          orderId,
          paymentIntent.id,
          customerInfo.email,
          customerInfo.name || `${customerInfo.firstName} ${customerInfo.lastName}`,
          JSON.stringify({
            address: customerInfo.address,
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country
          }),
          JSON.stringify(items),
          amount, // Subtotal (no VAT)
          0, // Tax removed
          amount,
          validCurrency.toUpperCase()
        ]
      );
    } catch (dbError) {
      console.error('Error creating order record:', dbError);
      // Continue with payment intent creation even if DB fails
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: orderId
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      message: 'Error creating payment intent',
      error: error.message 
    });
  }
}