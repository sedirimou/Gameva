// Static Page Components Registry
import HeroSection from './HeroSection';
import TextBlock from './TextBlock';
import ShippingInfoBlock from './ShippingInfoBlock';
import ButtonBlock from './ButtonBlock';
import ImageBlock from './ImageBlock';
import SpacerBlock from './SpacerBlock';
import PageHeader from './PageHeader';
import TwoColumnSection from './TwoColumnSection';
import WhatWeOfferSection from './WhatWeOfferSection';
import WhyChooseUsSection from './WhyChooseUsSection';
import CallToActionSection from './CallToActionSection';
import FAQSection from './FAQSection';
import InstantDeliverySection from './InstantDeliverySection';
import RegionalAvailabilitySection from './RegionalAvailabilitySection';
import TroubleshootingSection from './TroubleshootingSection';
import GDPRSection from './GDPRSection';
import CookiePolicySection from './CookiePolicySection';
import LegalComplianceSection from './LegalComplianceSection';
import RightsSection from './RightsSection';

export const componentRegistry = {
  HeroSection: {
    name: 'HeroSection',
    component: HeroSection,
    displayName: 'Hero Section',
    description: 'Hero section with title, subtitle, and call-to-action',
    category: 'Layout',
    icon: '🦸',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Enter hero title'
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'textarea',
        required: false,
        placeholder: 'Enter hero subtitle'
      },
      {
        name: 'buttonText',
        label: 'Button Text',
        type: 'text',
        required: false,
        placeholder: 'Call to Action'
      },
      {
        name: 'buttonLink',
        label: 'Button Link',
        type: 'text',
        required: false,
        placeholder: '/link-to-page'
      },
      {
        name: 'backgroundImage',
        label: 'Background Image URL',
        type: 'text',
        required: false,
        placeholder: 'https://example.com/image.jpg'
      }
    ]
  },
  TextBlock: {
    name: 'TextBlock',
    component: TextBlock,
    displayName: 'Text Block',
    description: 'Rich text content block',
    category: 'Content',
    icon: '📝',
    fields: [
      {
        name: 'content',
        label: 'Content',
        type: 'html',
        required: true,
        placeholder: 'Enter your content'
      },
      {
        name: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        required: false,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        default: 'left'
      }
    ]
  },
  ShippingInfoBlock: {
    name: 'ShippingInfoBlock',
    component: ShippingInfoBlock,
    displayName: 'Shipping Information',
    description: 'Shipping and delivery information block',
    category: 'Ecommerce',
    icon: '🚚',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Shipping Information'
      },
      {
        name: 'content',
        label: 'Content',
        type: 'html',
        required: true,
        placeholder: 'Enter shipping details'
      }
    ]
  },
  ButtonBlock: {
    name: 'ButtonBlock',
    component: ButtonBlock,
    displayName: 'Button',
    description: 'Call-to-action button',
    category: 'Interactive',
    icon: '🔘',
    fields: [
      {
        name: 'text',
        label: 'Button Text',
        type: 'text',
        required: true,
        placeholder: 'Click Me'
      },
      {
        name: 'link',
        label: 'Link URL',
        type: 'text',
        required: true,
        placeholder: '/page-link'
      },
      {
        name: 'style',
        label: 'Button Style',
        type: 'select',
        required: false,
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' }
        ],
        default: 'primary'
      },
      {
        name: 'size',
        label: 'Button Size',
        type: 'select',
        required: false,
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ],
        default: 'medium'
      }
    ]
  },
  ImageBlock: {
    name: 'ImageBlock',
    component: ImageBlock,
    displayName: 'Image Block',
    description: 'Image with optional caption',
    category: 'Media',
    icon: '🖼️',
    fields: [
      {
        name: 'src',
        label: 'Image URL',
        type: 'text',
        required: true,
        placeholder: 'https://example.com/image.jpg'
      },
      {
        name: 'alt',
        label: 'Alt Text',
        type: 'text',
        required: true,
        placeholder: 'Image description'
      },
      {
        name: 'caption',
        label: 'Caption',
        type: 'text',
        required: false,
        placeholder: 'Image caption'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'select',
        required: false,
        options: [
          { value: 'full', label: 'Full Width' },
          { value: 'large', label: 'Large (75%)' },
          { value: 'medium', label: 'Medium (50%)' },
          { value: 'small', label: 'Small (25%)' }
        ],
        default: 'full'
      }
    ]
  },
  SpacerBlock: {
    name: 'SpacerBlock',
    component: SpacerBlock,
    displayName: 'Spacer',
    description: 'Empty space for layout',
    category: 'Layout',
    icon: '📏',
    fields: [
      {
        name: 'height',
        label: 'Height',
        type: 'select',
        required: false,
        options: [
          { value: 'small', label: 'Small (20px)' },
          { value: 'medium', label: 'Medium (40px)' },
          { value: 'large', label: 'Large (60px)' },
          { value: 'xlarge', label: 'Extra Large (80px)' }
        ],
        default: 'medium'
      }
    ]
  },
  PageHeader: {
    name: 'PageHeader',
    component: PageHeader,
    displayName: 'Page Header',
    description: 'Header section with title and description',
    category: 'Layout',
    icon: '📋',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Enter page title'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Enter page description'
      }
    ]
  },
  TwoColumnSection: {
    name: 'TwoColumnSection',
    component: TwoColumnSection,
    displayName: 'Two Column Section',
    description: 'Side-by-side content columns',
    category: 'Layout',
    icon: '📑',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: false,
        placeholder: 'Optional section title'
      }
    ]
  },
  WhatWeOfferSection: {
    name: 'WhatWeOfferSection',
    component: WhatWeOfferSection,
    displayName: 'What We Offer',
    description: 'Feature grid with icons',
    category: 'Content',
    icon: '🎯',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'What We Offer'
      }
    ]
  },
  WhyChooseUsSection: {
    name: 'WhyChooseUsSection',
    component: WhyChooseUsSection,
    displayName: 'Why Choose Us',
    description: 'Feature list with icons',
    category: 'Content',
    icon: '⭐',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Why Choose Us?'
      }
    ]
  },
  CallToActionSection: {
    name: 'CallToActionSection',
    component: CallToActionSection,
    displayName: 'Call to Action',
    description: 'CTA section with buttons',
    category: 'Interactive',
    icon: '🎯',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Ready to Start?'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Call to action description'
      }
    ]
  },
  FAQSection: {
    name: 'FAQSection',
    component: FAQSection,
    displayName: 'FAQ Section',
    description: 'Collapsible FAQ categories',
    category: 'Content',
    icon: '❓',
    fields: []
  },
  InstantDeliverySection: {
    name: 'InstantDeliverySection',
    component: InstantDeliverySection,
    displayName: 'Instant Delivery',
    description: 'Delivery process explanation',
    category: 'Ecommerce',
    icon: '⚡',
    fields: []
  },
  RegionalAvailabilitySection: {
    name: 'RegionalAvailabilitySection',
    component: RegionalAvailabilitySection,
    displayName: 'Regional Availability',
    description: 'Regional product availability',
    category: 'Ecommerce',
    icon: '🌍',
    fields: []
  },
  TroubleshootingSection: {
    name: 'TroubleshootingSection',
    component: TroubleshootingSection,
    displayName: 'Troubleshooting',
    description: 'Issue resolution guide',
    category: 'Content',
    icon: '🔧',
    fields: []
  },
  GDPRSection: {
    name: 'GDPRSection',
    component: GDPRSection,
    displayName: 'GDPR Section',
    description: 'GDPR compliance information section',
    category: 'Legal',
    icon: '🔒',
    fields: [
      {
        name: 'title',
        label: 'Section Title',
        type: 'text',
        required: true,
        placeholder: 'Data Protection & Privacy'
      },
      {
        name: 'sections',
        label: 'GDPR Sections',
        type: 'array',
        required: true,
        fields: [
          {
            name: 'title',
            label: 'Section Title',
            type: 'text',
            required: true
          },
          {
            name: 'content',
            label: 'Content',
            type: 'textarea',
            required: true
          },
          {
            name: 'items',
            label: 'List Items',
            type: 'array',
            fields: [
              {
                name: 'item',
                label: 'Item',
                type: 'text'
              }
            ]
          }
        ]
      }
    ]
  },
  CookiePolicySection: {
    name: 'CookiePolicySection',
    component: CookiePolicySection,
    displayName: 'Cookie Policy',
    description: 'Cookie policy and preferences section',
    category: 'Legal',
    icon: '🍪',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Cookie Policy'
      },
      {
        name: 'introduction',
        label: 'Introduction',
        type: 'textarea',
        required: false,
        placeholder: 'Introduction to cookie policy'
      },
      {
        name: 'cookieTypes',
        label: 'Cookie Types',
        type: 'array',
        required: true,
        fields: [
          {
            name: 'name',
            label: 'Cookie Type Name',
            type: 'text',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true
          },
          {
            name: 'required',
            label: 'Required',
            type: 'checkbox',
            required: false
          },
          {
            name: 'examples',
            label: 'Examples',
            type: 'array',
            fields: [
              {
                name: 'example',
                label: 'Example',
                type: 'text'
              }
            ]
          }
        ]
      }
    ]
  },
  LegalComplianceSection: {
    name: 'LegalComplianceSection',
    component: LegalComplianceSection,
    displayName: 'Legal Compliance',
    description: 'Legal compliance and regulations section',
    category: 'Legal',
    icon: '⚖️',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Legal Compliance'
      },
      {
        name: 'regulations',
        label: 'Regulations',
        type: 'array',
        required: true,
        fields: [
          {
            name: 'name',
            label: 'Regulation Name',
            type: 'text',
            required: true
          },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'gdpr', label: 'GDPR' },
              { value: 'ccpa', label: 'CCPA' },
              { value: 'coppa', label: 'COPPA' },
              { value: 'pci', label: 'PCI DSS' },
              { value: 'accessibility', label: 'Accessibility' }
            ]
          },
          {
            name: 'jurisdiction',
            label: 'Jurisdiction',
            type: 'text',
            required: true
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true
          },
          {
            name: 'status',
            label: 'Compliance Status',
            type: 'select',
            required: false,
            options: [
              { value: 'compliant', label: 'Compliant' },
              { value: 'partial', label: 'Partial' },
              { value: 'non-compliant', label: 'Non-Compliant' }
            ]
          }
        ]
      }
    ]
  },
  RightsSection: {
    name: 'RightsSection',
    component: RightsSection,
    displayName: 'User Rights',
    description: 'User data protection rights section',
    category: 'Legal',
    icon: '✋',
    fields: [
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Your Rights'
      },
      {
        name: 'subtitle',
        label: 'Subtitle',
        type: 'text',
        required: false,
        placeholder: 'Under European data protection law...'
      },
      {
        name: 'rights',
        label: 'User Rights',
        type: 'array',
        required: true,
        fields: [
          {
            name: 'name',
            label: 'Right Name',
            type: 'text',
            required: true
          },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'access', label: 'Right of Access' },
              { value: 'rectification', label: 'Right to Rectification' },
              { value: 'erasure', label: 'Right to Erasure' },
              { value: 'restriction', label: 'Right to Restriction' },
              { value: 'portability', label: 'Right to Portability' },
              { value: 'objection', label: 'Right to Object' },
              { value: 'complaint', label: 'Right to Complaint' }
            ]
          },
          {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            required: true
          },
          {
            name: 'howToExercise',
            label: 'How to Exercise',
            type: 'textarea',
            required: false
          },
          {
            name: 'timeframe',
            label: 'Response Timeframe',
            type: 'text',
            required: false,
            placeholder: '30 days'
          }
        ]
      }
    ]
  }
};

// Helper functions
export const getComponentByName = (name) => {
  return componentRegistry[name] || null;
};

export const getAllComponents = () => {
  return Object.values(componentRegistry);
};

export const getComponentsByCategory = (category) => {
  return Object.values(componentRegistry).filter(comp => comp.category === category);
};

export const getComponentCategories = () => {
  const categories = [...new Set(Object.values(componentRegistry).map(comp => comp.category))];
  return categories.sort();
};