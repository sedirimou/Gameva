/**
 * LeeCMS Components Export
 * Central export file for all LeeCMS components
 */

export { default as TextBlock } from './TextBlock';
export { default as ImageBlock } from './ImageBlock';
export { default as CallToAction } from './CallToAction';
export { default as VideoEmbed } from './VideoEmbed';
export { default as HTMLEmbed } from './HTMLEmbed';
export { default as ProductGrid } from './ProductGrid';
export { default as ContactForm } from './ContactForm';

// Component configurations for easy access
export const componentConfigs = {
  'text-block': {
    name: 'Text Block',
    icon: '📝',
    description: 'Rich text content with formatting options',
    category: 'content'
  },
  'image-block': {
    name: 'Image Block',
    icon: '🖼️',
    description: 'Images with captions and styling',
    category: 'media'
  },
  'call-to-action': {
    name: 'Call to Action',
    icon: '🔘',
    description: 'Buttons and action elements',
    category: 'interactive'
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
  },
  'contact-form': {
    name: 'Contact Form',
    icon: '📧',
    description: 'Professional contact form with file uploads',
    category: 'content'
  }
};