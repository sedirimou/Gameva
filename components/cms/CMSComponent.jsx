/**
 * LeeCMS Component Renderer
 * Dynamically renders components based on type with edit capabilities
 */
import { useState } from 'react';
import TextBlock from './components/TextBlock';
import ImageBlock from './components/ImageBlock';
import HTMLEmbed from './components/HTMLEmbed';
import CallToAction from './components/CallToAction';
import VideoEmbed from './components/VideoEmbed';
import ProductGrid from './components/ProductGrid';
import HeroSection from './components/HeroSection';
import ContactForm from './components/ContactForm';
import ComponentEditor from './ComponentEditor';

// Preline Components Removed per user request

// Component Registry

const componentRegistry = {
  // Original LeeCMS Components
  'text-block': {
    component: TextBlock,
    name: 'Text Block',
    icon: '📝',
    description: 'Rich text content with formatting options',
    category: 'Basic'
  },
  'image-block': {
    component: ImageBlock,
    name: 'Image Block',
    icon: '🖼️',
    description: 'Images with captions and styling',
    category: 'Basic'
  },
  'hero-section': {
    component: HeroSection,
    name: 'Hero Section',
    icon: '🎯',
    description: 'Full-width hero banner with call-to-action',
    category: 'Basic'
  },
  'html-embed': {
    component: HTMLEmbed,
    name: 'HTML Embed',
    icon: '💻',
    description: 'Custom HTML content',
    category: 'Basic'
  },
  'call-to-action': {
    component: CallToAction,
    name: 'Call to Action',
    icon: '🔘',
    description: 'Buttons and action elements',
    category: 'Basic'
  },
  'video-embed': {
    component: VideoEmbed,
    name: 'Video Embed',
    icon: '📹',
    description: 'YouTube and Vimeo videos',
    category: 'Basic'
  },
  'product-grid': {
    component: ProductGrid,
    name: 'Product Grid',
    icon: '🛍️',
    description: 'Dynamic product listings',
    category: 'Basic'
  },
  'contact-form': {
    component: ContactForm,
    name: 'Contact Form',
    icon: '📧',
    description: 'Professional contact form with file uploads',
    category: 'Basic'
  }
};

const CMSComponent = ({ component, isEditing, onUpdate, onCancelEdit }) => {
  const [showEditor, setShowEditor] = useState(false);

  const componentConfig = componentRegistry[component.type];
  
  if (!componentConfig) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-red-500">⚠️</span>
          <span className="text-red-700 font-medium">Unknown Component</span>
        </div>
        <p className="text-red-600 text-sm mt-1">
          Component type "{component.type}" is not registered.
        </p>
      </div>
    );
  }

  const ComponentToRender = componentConfig.component;

  const handleEdit = () => {
    setShowEditor(true);
  };

  const handleSave = (updatedData) => {
    onUpdate({
      ...component,
      data: updatedData
    });
    setShowEditor(false);
  };

  const handleCancel = () => {
    setShowEditor(false);
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  if (showEditor || isEditing) {
    return (
      <ComponentEditor
        component={component}
        onSave={handleSave}
        onCancel={handleCancel}
        componentConfig={componentConfig}
      />
    );
  }

  return (
    <div className="relative group">
      <ComponentToRender data={component.data || {}} />
      
      {/* Edit Overlay (when hovering in edit mode) */}
      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {componentConfig.icon} {componentConfig.name}
        </div>
      </div>
    </div>
  );
};

export { componentRegistry };
export default CMSComponent;