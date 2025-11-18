// Script to create the 4 static pages in the footer pages system
// This will be executed once to migrate the static pages

const { query } = require('../lib/database');

const pages = [
  {
    title: 'About Us',
    slug: 'about-us',
    type: 'static',
    page_category_id: 1, // Quick Links
    meta_title: 'About Us - Gamava',
    meta_description: 'Learn about Gamava - Your trusted destination for digital gaming products, software, and entertainment.',
    content_json: {
      components: [
        {
          type: 'PageHeader',
          data: {
            title: 'About Gamava',
            description: 'Your trusted destination for digital gaming products, software, and entertainment solutions.'
          }
        },
        {
          type: 'TwoColumnSection',
          data: {
            title: null,
            columns: [
              {
                title: 'Our Story',
                content: [
                  'Founded with a passion for gaming and technology, Gamava has emerged as a leading platform for digital gaming products. We specialize in providing instant access to the latest games, software, and digital entertainment across all major platforms.',
                  'Our journey began with a simple vision: to make digital gaming accessible, affordable, and instant for gamers worldwide. Today, we serve thousands of satisfied customers with our extensive catalog of premium gaming products.'
                ]
              },
              {
                title: 'Our Mission',
                content: [
                  'To revolutionize the digital gaming marketplace by providing instant, secure, and affordable access to the world\'s best gaming content. We believe every gamer deserves access to premium experiences without barriers.',
                  'We\'re committed to building lasting relationships with our customers through exceptional service, competitive pricing, and a seamless shopping experience that puts gamers first.'
                ]
              }
            ]
          }
        },
        {
          type: 'WhatWeOfferSection',
          data: {
            title: 'What We Offer',
            items: [
              {
                title: 'PC Games',
                description: 'Extensive collection of PC games across all genres and platforms',
                icon: 'check'
              },
              {
                title: 'Software',
                description: 'Professional software and applications for productivity and creativity',
                icon: 'star'
              },
              {
                title: 'Gift Cards',
                description: 'Digital gift cards for all major gaming platforms and stores',
                icon: 'gift'
              },
              {
                title: 'Subscriptions',
                description: 'Gaming subscriptions and premium memberships at competitive prices',
                icon: 'user'
              }
            ]
          }
        },
        {
          type: 'WhyChooseUsSection',
          data: {
            title: 'Why Choose Gamava?',
            features: [
              {
                title: 'Instant Delivery',
                description: 'Get your digital products instantly after purchase with our automated delivery system.',
                icon: 'clock'
              },
              {
                title: 'Secure Transactions',
                description: 'All transactions are protected with industry-standard encryption and security measures.',
                icon: 'shield'
              },
              {
                title: '24/7 Support',
                description: 'Our dedicated support team is available around the clock to assist you.',
                icon: 'check'
              },
              {
                title: 'Best Prices',
                description: 'Competitive pricing with regular discounts and special offers for our customers.',
                icon: 'calendar'
              },
              {
                title: 'Quality Products',
                description: 'All products are genuine and sourced from authorized distributors and publishers.',
                icon: 'star'
              },
              {
                title: 'Global Reach',
                description: 'Serving customers worldwide with region-specific products and localized support.',
                icon: 'user'
              }
            ]
          }
        },
        {
          type: 'CallToActionSection',
          data: {
            title: 'Ready to Start Gaming?',
            description: 'Join thousands of satisfied customers and discover your next favorite game today.',
            buttons: [
              {
                text: 'Browse Products',
                link: '/category/all-products',
                style: 'primary'
              },
              {
                text: 'Contact Us',
                link: '/contact-us',
                style: 'secondary'
              }
            ]
          }
        }
      ]
    },
    sort_order: 1
  },
  {
    title: 'Frequently Asked Questions',
    slug: 'faqs',
    type: 'static',
    page_category_id: 2, // Customer Service
    meta_title: 'Frequently Asked Questions - Gamava',
    meta_description: 'Find answers to common questions about Gamava\'s products, services, and policies. Get help with orders, payments, and technical issues.',
    content_json: {
      components: [
        {
          type: 'PageHeader',
          data: {
            title: 'Frequently Asked Questions',
            description: 'Find answers to common questions about our products, services, and policies.'
          }
        },
        {
          type: 'FAQSection',
          data: {
            categories: [
              {
                category: 'General',
                questions: [
                  {
                    question: 'What is Gamava?',
                    answer: 'Gamava is a digital marketplace specializing in gaming products, software, gift cards, and subscriptions. We provide instant delivery of digital products to customers worldwide.'
                  },
                  {
                    question: 'How do I create an account?',
                    answer: 'Click the \'Sign Up\' button in the top right corner of our website. You can register using your email address or sign up instantly with Steam, Discord, or Google accounts.'
                  },
                  {
                    question: 'Is my personal information secure?',
                    answer: 'Yes, we use industry-standard encryption and security measures to protect your personal information. All transactions are processed through secure payment gateways.'
                  },
                  {
                    question: 'What payment methods do you accept?',
                    answer: 'We accept major credit cards, PayPal, and various digital payment methods through our secure Stripe payment processor.'
                  }
                ]
              },
              {
                category: 'Orders & Delivery',
                questions: [
                  {
                    question: 'How quickly will I receive my purchase?',
                    answer: 'Most digital products are delivered instantly after payment confirmation. You\'ll receive your product key or download link via email within seconds of completing your purchase.'
                  },
                  {
                    question: 'What if I don\'t receive my product?',
                    answer: 'If you don\'t receive your product within 10 minutes of purchase, please check your spam folder first. If it\'s still not there, contact our support team and we\'ll resolve the issue immediately.'
                  },
                  {
                    question: 'Can I track my order?',
                    answer: 'Yes, you can track all your orders in your account dashboard under \'My Orders\'. You\'ll also receive email confirmations for each purchase.'
                  },
                  {
                    question: 'What format will my product key be in?',
                    answer: 'Product keys are delivered as alphanumeric codes that you can copy and paste into the respective platform (Steam, Epic Games, etc.). We also provide activation instructions for each product.'
                  }
                ]
              },
              {
                category: 'Product Information',
                questions: [
                  {
                    question: 'Are all products genuine?',
                    answer: 'Yes, all our products are sourced from authorized distributors and publishers. We guarantee the authenticity of every product key and digital download.'
                  },
                  {
                    question: 'Can I use products from any region?',
                    answer: 'Product regional restrictions vary by publisher. We clearly mark region-specific products and recommend checking compatibility before purchase.'
                  },
                  {
                    question: 'What platforms do you support?',
                    answer: 'We support all major gaming platforms including Steam, Epic Games Store, Origin, Uplay, Xbox, PlayStation, Nintendo Switch, and many more.'
                  },
                  {
                    question: 'Do you sell pre-order games?',
                    answer: 'Yes, we offer pre-orders for upcoming games. Pre-order keys are delivered on or before the official release date.'
                  }
                ]
              },
              {
                category: 'Account & Support',
                questions: [
                  {
                    question: 'How do I reset my password?',
                    answer: 'Click \'Forgot Password\' on the login page and enter your email address. You\'ll receive a password reset link within a few minutes.'
                  },
                  {
                    question: 'Can I change my email address?',
                    answer: 'Yes, you can update your email address in your account settings. You\'ll need to verify the new email address before the change takes effect.'
                  },
                  {
                    question: 'How do I contact customer support?',
                    answer: 'You can reach our support team through the Contact Us page, live chat, or email us at support@gamava.com. We\'re available 24/7 to assist you.'
                  },
                  {
                    question: 'What is your refund policy?',
                    answer: 'We offer refunds for unused digital products within 14 days of purchase, provided the product key hasn\'t been activated. Physical products can be returned according to our return policy.'
                  }
                ]
              },
              {
                category: 'Technical Issues',
                questions: [
                  {
                    question: 'My product key isn\'t working. What should I do?',
                    answer: 'First, ensure you\'re entering the key correctly with no extra spaces. If the key still doesn\'t work, contact our support team with your order details for immediate assistance.'
                  },
                  {
                    question: 'Can I download my purchase multiple times?',
                    answer: 'Yes, you can access your purchase history and download links anytime from your account dashboard. Digital products remain available for re-download.'
                  },
                  {
                    question: 'What if I accidentally purchased the wrong product?',
                    answer: 'Contact our support team immediately if you\'ve purchased the wrong product. We may be able to exchange it for the correct one if the key hasn\'t been activated.'
                  },
                  {
                    question: 'Do you offer technical support for games?',
                    answer: 'We provide support for purchase and activation issues. For game-specific technical problems, please contact the game\'s publisher or developer support team.'
                  }
                ]
              }
            ]
          }
        },
        {
          type: 'CallToActionSection',
          data: {
            title: 'Can\'t Find What You\'re Looking For?',
            description: 'Our support team is available 24/7 to help you with any questions or issues.',
            buttons: [
              {
                text: 'Contact Support',
                link: '/contact-us',
                style: 'primary'
              },
              {
                text: 'Email Us',
                link: 'mailto:support@gamava.com',
                style: 'secondary'
              }
            ]
          }
        }
      ]
    },
    sort_order: 2
  },
  {
    title: 'Contact Us',
    slug: 'contact-us',
    type: 'static',
    page_category_id: 2, // Customer Service
    meta_title: 'Contact Us - Gamava',
    meta_description: 'Get in touch with Gamava\'s customer support team. We\'re here to help with your questions, orders, and technical issues.',
    content_json: {
      components: [
        {
          type: 'PageHeader',
          data: {
            title: 'Contact Us',
            description: 'We\'re here to help! Get in touch with our support team for any questions or assistance.'
          }
        },
        {
          type: 'TwoColumnContactSection',
          data: {
            leftColumn: {
              type: 'ContactForm',
              title: 'Send us a Message',
              fields: [
                {
                  name: 'name',
                  label: 'Full Name *',
                  type: 'text',
                  placeholder: 'Enter your full name',
                  required: true
                },
                {
                  name: 'email',
                  label: 'Email Address *',
                  type: 'email',
                  placeholder: 'Enter your email address',
                  required: true
                },
                {
                  name: 'subject',
                  label: 'Subject *',
                  type: 'select',
                  placeholder: 'Select a subject',
                  required: true,
                  options: [
                    'Order Support',
                    'Technical Issue',
                    'Payment Problem',
                    'Product Question',
                    'Account Issue',
                    'General Inquiry',
                    'Partnership',
                    'Other'
                  ]
                },
                {
                  name: 'message',
                  label: 'Message *',
                  type: 'textarea',
                  placeholder: 'Please describe your question or issue in detail...',
                  required: true,
                  rows: 6
                }
              ],
              submitText: 'Send Message'
            },
            rightColumn: {
              sections: [
                {
                  title: 'Get in Touch',
                  items: [
                    {
                      icon: 'email',
                      title: 'Email Support',
                      value: 'support@gamava.com',
                      description: 'Response time: Within 24 hours'
                    },
                    {
                      icon: 'phone',
                      title: 'Live Chat',
                      value: 'Available 24/7',
                      description: 'Click the chat icon in the bottom right'
                    },
                    {
                      icon: 'clock',
                      title: 'Response Time',
                      value: 'Average: 2-4 hours',
                      description: 'Urgent issues: Within 1 hour'
                    }
                  ]
                },
                {
                  title: 'Need Quick Answers?',
                  description: 'Check our FAQ section for instant answers to common questions about orders, payments, and technical issues.',
                  link: {
                    text: 'Visit FAQ',
                    url: '/faqs'
                  }
                },
                {
                  title: 'Support Hours',
                  schedule: [
                    { day: 'Monday - Friday', hours: '24/7' },
                    { day: 'Saturday - Sunday', hours: '24/7' },
                    { day: 'Holidays', hours: '24/7' }
                  ],
                  note: 'Our automated systems ensure instant delivery even during off-hours.'
                }
              ]
            }
          }
        },
        {
          type: 'CallToActionSection',
          data: {
            title: 'Still Need Help?',
            description: 'Our dedicated support team is committed to providing you with the best possible experience.',
            buttons: [
              {
                text: 'Track My Order',
                link: '/user/orders',
                style: 'primary'
              },
              {
                text: 'Shipping Info',
                link: '/shipping-info',
                style: 'secondary'
              }
            ]
          }
        }
      ]
    },
    sort_order: 3
  },
  {
    title: 'Shipping & Delivery Information',
    slug: 'shipping-info',
    type: 'static',
    page_category_id: 2, // Customer Service
    meta_title: 'Shipping & Delivery Information - Gamava',
    meta_description: 'Learn about Gamava\'s digital product delivery, shipping policies, and instant delivery system for games, software, and digital products.',
    content_json: {
      components: [
        {
          type: 'PageHeader',
          data: {
            title: 'Shipping & Delivery Information',
            description: 'Everything you need to know about how we deliver your digital products instantly and securely.'
          }
        },
        {
          type: 'InstantDeliverySection',
          data: {
            title: 'Instant Digital Delivery',
            leftColumn: {
              title: 'How It Works',
              steps: [
                'Complete your purchase using any of our secure payment methods',
                'Receive instant email confirmation with your order details',
                'Your product key and activation instructions are delivered immediately',
                'Access your library anytime through your account dashboard'
              ]
            },
            rightColumn: {
              title: 'Delivery Time',
              deliveryTimes: [
                { product: 'Digital Games & Software', time: 'Instant', status: 'success' },
                { product: 'Gift Cards', time: 'Instant', status: 'success' },
                { product: 'Subscriptions', time: 'Instant', status: 'success' },
                { product: 'Pre-orders', time: 'Release Date', status: 'warning' }
              ]
            }
          }
        },
        {
          type: 'TwoColumnSection',
          data: {
            title: null,
            columns: [
              {
                title: 'Email Delivery',
                items: [
                  'Product keys delivered to your registered email address',
                  'Detailed activation instructions included',
                  'Order confirmation and receipt attached',
                  'Backup delivery to account dashboard'
                ]
              },
              {
                title: 'Account Dashboard',
                items: [
                  'Access your complete purchase history',
                  'Re-download product keys anytime',
                  'Track order status and delivery confirmation',
                  'Organize your digital library'
                ]
              }
            ]
          }
        },
        {
          type: 'RegionalAvailabilitySection',
          data: {
            title: 'Regional Availability',
            regions: [
              {
                title: 'Global Products',
                description: 'Available worldwide with no regional restrictions',
                stat: '~86,000 products',
                status: 'success'
              },
              {
                title: 'Region-Specific',
                description: 'Products with regional activation requirements',
                details: [
                  'Europe: ~73,000 products',
                  'North America: ~69,000 products',
                  'Asia: ~60,000 products'
                ]
              },
              {
                title: 'Language Support',
                description: 'Multi-language activation instructions',
                details: [
                  'English (Primary)',
                  'German, French, Spanish',
                  'Additional languages available'
                ]
              }
            ]
          }
        },
        {
          type: 'TroubleshootingSection',
          data: {
            title: 'Delivery Troubleshooting',
            leftColumn: {
              title: 'Common Issues',
              issues: [
                {
                  issue: 'Email Not Received',
                  solution: 'Check your spam/junk folder and whitelist support@gamava.com'
                },
                {
                  issue: 'Invalid Product Key',
                  solution: 'Ensure correct platform and check for typing errors'
                },
                {
                  issue: 'Region Restrictions',
                  solution: 'Verify product compatibility with your region before purchase'
                }
              ]
            },
            rightColumn: {
              title: 'Quick Solutions',
              steps: [
                {
                  step: 'Step 1: Check Account',
                  description: 'Log into your dashboard and check "My Orders" section'
                },
                {
                  step: 'Step 2: Verify Email',
                  description: 'Check all email folders including spam and promotions'
                },
                {
                  step: 'Step 3: Contact Support',
                  description: 'If issues persist, contact our 24/7 support team'
                }
              ]
            }
          }
        },
        {
          type: 'CallToActionSection',
          data: {
            title: 'Need Help with Your Order?',
            description: 'Our support team is available 24/7 to assist with any delivery issues or questions.',
            buttons: [
              {
                text: 'Contact Support',
                link: '/contact-us',
                style: 'primary'
              },
              {
                text: 'Check FAQ',
                link: '/faqs',
                style: 'secondary'
              }
            ]
          }
        }
      ]
    },
    sort_order: 4
  }
];

async function createPages() {
  console.log('Creating static pages in footer pages system...');
  
  for (const page of pages) {
    try {
      console.log(`Creating page: ${page.title}`);
      
      // Check if page already exists
      const existing = await query('SELECT id FROM pages WHERE slug = $1', [page.slug]);
      
      if (existing.rows.length > 0) {
        console.log(`Page ${page.slug} already exists, skipping...`);
        continue;
      }
      
      // Create the page
      const result = await query(`
        INSERT INTO pages (
          title, 
          slug, 
          type, 
          page_category_id,
          content_json,
          meta_title,
          meta_description,
          is_active,
          sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, slug
      `, [
        page.title,
        page.slug,
        page.type,
        page.page_category_id,
        JSON.stringify(page.content_json),
        page.meta_title,
        page.meta_description,
        true,
        page.sort_order
      ]);
      
      console.log(`✓ Created page: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
      
    } catch (error) {
      console.error(`Error creating page ${page.title}:`, error);
    }
  }
  
  console.log('Static pages creation completed!');
}

if (require.main === module) {
  createPages().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createPages };