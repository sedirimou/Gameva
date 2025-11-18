export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const webhookEndpoint = `${req.headers.host}/api/webhooks/stripe`;
  const protocol = req.headers.host?.includes('localhost') ? 'http' : 'https';
  
  res.json({
    webhook_endpoint: `${protocol}://${webhookEndpoint}`,
    setup_instructions: {
      title: "Stripe Webhook Setup Instructions",
      steps: [
        {
          step: 1,
          title: "Access Stripe Dashboard",
          description: "Go to https://dashboard.stripe.com/webhooks"
        },
        {
          step: 2,
          title: "Create New Endpoint",
          description: "Click 'Add endpoint' button"
        },
        {
          step: 3,
          title: "Add Endpoint URL",
          description: `Enter: ${protocol}://${webhookEndpoint}`,
          note: "For development, use ngrok to expose localhost"
        },
        {
          step: 4,
          title: "Select Events",
          description: "Choose these events:",
          events: [
            "payment_intent.succeeded",
            "payment_intent.payment_failed", 
            "payment_intent.canceled",
            "payment_intent.requires_action"
          ]
        },
        {
          step: 5,
          title: "Copy Webhook Secret",
          description: "After creating, copy the signing secret and add it as STRIPE_WEBHOOK_SECRET environment variable"
        }
      ],
      development_setup: {
        title: "Development Setup with ngrok",
        commands: [
          "npm install -g ngrok",
          "ngrok http 5000",
          "Copy the https URL and use it as webhook endpoint in Stripe Dashboard"
        ]
      },
      environment_variables: {
        required: [
          "STRIPE_SECRET_KEY",
          "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", 
          "STRIPE_WEBHOOK_SECRET"
        ]
      }
    }
  });
}