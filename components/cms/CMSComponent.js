/**
 * CMS Component Registry
 * Central registry for all available LeeCMS components
 */

// Component registry with metadata
export const componentRegistry = {
  'text-block': {
    name: 'Text Block',
    icon: '📝',
    description: 'Rich text content with formatting',
    category: 'content'
  },
  'image-block': {
    name: 'Image Block', 
    icon: '🖼️',
    description: 'Images with captions and styling',
    category: 'media'
  },
  'hero-section': {
    name: 'Hero Section',
    icon: '🌟',
    description: 'Large page header with call-to-action',
    category: 'layout'
  },
  'about-us-section': {
    name: 'About Us Section',
    icon: '👥',
    description: 'Company information and story',
    category: 'business'
  },
  'call-to-action': {
    name: 'Call to Action',
    icon: '🔘',
    description: 'Buttons and action elements',
    category: 'interactive'
  },
  'call-to-action-section': {
    name: 'CTA Section',
    icon: '📢',
    description: 'Full-width call-to-action banner',
    category: 'business'
  },
  'button-block': {
    name: 'Button Block',
    icon: '🖲️',
    description: 'Custom styled buttons',
    category: 'interactive'
  },
  'contact-form': {
    name: 'Contact Form',
    icon: '📧',
    description: 'Customizable contact forms',
    category: 'interactive'
  },

  'faq-section': {
    name: 'FAQ Section',
    icon: '❓',
    description: 'Frequently asked questions with search',
    category: 'content'
  },
  'faqs-list': {
    name: 'FAQ List',
    icon: '📋',
    description: 'Simple collapsible FAQ list',
    category: 'content'
  },
  'gdpr-section': {
    name: 'GDPR Section',
    icon: '🔒',
    description: 'GDPR compliance information',
    category: 'legal'
  },
  'cookie-policy-section': {
    name: 'Cookie Policy',
    icon: '🍪',
    description: 'Cookie policy information',
    category: 'legal'
  },
  'video-embed': {
    name: 'Video Embed',
    icon: '📹', 
    description: 'YouTube and Vimeo videos',
    category: 'media'
  },
  'html-embed': {
    name: 'HTML Embed',
    icon: '💻',
    description: 'Custom HTML content',
    category: 'advanced'
  },
  'product-grid': {
    name: 'Product Grid',
    icon: '🛍️',
    description: 'Dynamic product listings',
    category: 'ecommerce'
  }
};

// Get components by category
export const getComponentsByCategory = (category) => {
  return Object.entries(componentRegistry)
    .filter(([key, config]) => config.category === category)
    .reduce((acc, [key, config]) => {
      acc[key] = config;
      return acc;
    }, {});
};

// Get all categories
export const getCategories = () => {
  const categories = [...new Set(
    Object.values(componentRegistry).map(config => config.category)
  )];
  return categories;
};