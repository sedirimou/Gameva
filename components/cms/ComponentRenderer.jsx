/**
 * ComponentRenderer - Renders individual CMS components
 */
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import ComponentEditor from './ComponentEditor';

// Import component types
import TextBlock from './components/TextBlock';
import ImageBlock from './components/ImageBlock';
import HeroSection from './components/HeroSection';
import AboutUsSection from './components/AboutUsSection';
import CallToAction from './components/CallToAction';
import CallToActionSection from './components/CallToActionSection';
import ButtonBlock from './components/ButtonBlock';
import ContactForm from './components/ContactForm';

import FAQSection from './components/FAQSection';
import FAQsList from './components/FAQsList';
import GDPRSection from './components/GDPRSection';
import CookiePolicySection from './components/CookiePolicySection';
import VideoEmbed from './components/VideoEmbed';
import HTMLEmbed from './components/HTMLEmbed';
import ProductGrid from './components/ProductGrid';

const componentMap = {
  'text-block': TextBlock,
  'image-block': ImageBlock,
  'hero-section': HeroSection,
  'about-us-section': AboutUsSection,
  'call-to-action': CallToAction,
  'call-to-action-section': CallToActionSection,
  'button-block': ButtonBlock,
  'contact-form': ContactForm,

  'faq-section': FAQSection,
  'faqs-list': FAQsList,
  'gdpr-section': GDPRSection,
  'cookie-policy-section': CookiePolicySection,
  'video-embed': VideoEmbed,
  'html-embed': HTMLEmbed,
  'product-grid': ProductGrid
};

const ComponentRenderer = ({ 
  component, 
  isEditing = false, 
  onUpdate, 
  onDelete 
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const ComponentType = componentMap[component.type];

  if (!ComponentType) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-600 text-sm">
          Unknown component type: {component.type}
        </p>
      </div>
    );
  }

  const handleSave = (updatedData) => {
    if (onUpdate) {
      onUpdate({
        ...component,
        data: updatedData
      });
    }
    setShowEditor(false);
  };

  if (!isEditing) {
    // Frontend display mode
    return <ComponentType data={component.data} isEditing={false} />;
  }

  // Editing mode
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Component Content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ComponentType data={component.data} isEditing={true} />
      </div>

      {/* Edit Controls */}
      {(isHovered || showEditor) && (
        <div className="absolute top-2 right-2 flex space-x-1 bg-white rounded shadow-lg border border-gray-200 p-1">
          <button
            onClick={() => setShowEditor(true)}
            className="p-1 text-blue-500 hover:text-blue-700 text-xs"
            title="Edit Component"
          >
            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete && onDelete()}
            className="p-1 text-red-500 hover:text-red-700 text-xs"
            title="Delete Component"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Component Editor Modal */}
      {showEditor && (
        <ComponentEditor
          component={component}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default ComponentRenderer;