/**
 * ComponentEditor - Modal editor for CMS components
 */
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

const ComponentEditor = ({ component, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [componentData, setComponentData] = useState(component.data || {});
  const editorRef = useRef(null);

  useEffect(() => {
    setComponentData(component.data || {});
  }, [component]);

  // Initialize CKEditor for text-block components
  useEffect(() => {
    if (component.type === 'text-block' && typeof window !== 'undefined' && window.CKEDITOR && editorRef.current) {
      const editorId = editorRef.current.id;
      
      // Destroy existing editor instance if it exists
      if (window.CKEDITOR.instances[editorId]) {
        window.CKEDITOR.instances[editorId].destroy(true);
      }

      // Initialize new CKEditor instance with a delay
      const initializeEditor = () => {
        if (editorRef.current && !window.CKEDITOR.instances[editorId]) {
          try {
            window.CKEDITOR.replace(editorId, {
              height: 300,
              // Use configuration from config.js but override height and callbacks
              resize_enabled: false,
              on: {
                instanceReady: function() {
                  // Set initial content
                  this.setData(componentData.content || '');
                },
                change: function() {
                  updateData('content', this.getData());
                }
              }
            });
          } catch (error) {
            console.error('CKEditor initialization error:', error);
          }
        }
      };

      // Use longer delay to avoid conflicts
      setTimeout(initializeEditor, 300);
    }

    // Cleanup function
    return () => {
      if (editorRef.current && window.CKEDITOR) {
        const editorId = editorRef.current.id;
        if (window.CKEDITOR.instances[editorId]) {
          window.CKEDITOR.instances[editorId].destroy(true);
        }
      }
    };
  }, [component.type]);

  // Update CKEditor content when componentData changes
  useEffect(() => {
    if (component.type === 'text-block' && editorRef.current && window.CKEDITOR) {
      const editorId = editorRef.current.id;
      const editorInstance = window.CKEDITOR.instances[editorId];
      
      if (editorInstance && componentData.content !== editorInstance.getData()) {
        editorInstance.setData(componentData.content || '');
      }
    }
  }, [componentData.content, component.type]);

  // Load CKEditor script if not already loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.CKEDITOR) {
      const script = document.createElement('script');
      script.src = '/ckeditor/ckeditor.js';
      script.async = true;
      script.onload = () => {
        console.log('CKEditor loaded successfully from local files');
      };
      document.head.appendChild(script);
    }
  }, []);

  const updateData = (key, value) => {
    setComponentData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Get latest content from CKEditor if it exists
    if (component.type === 'text-block' && editorRef.current && window.CKEDITOR) {
      const editorInstance = window.CKEDITOR.instances[editorRef.current.id];
      if (editorInstance) {
        const latestContent = editorInstance.getData();
        updateData('content', latestContent);
        onSave({
          ...componentData,
          content: latestContent
        });
        return;
      }
    }
    
    onSave(componentData);
  };

  const renderContentTab = () => {
    switch (component.type) {
      case 'text-block':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title 1
                </label>
                <input
                  type="text"
                  value={componentData.title1 || ''}
                  onChange={(e) => updateData('title1', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-50"
                  placeholder="Enter first title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title 2
                </label>
                <input
                  type="text"
                  value={componentData.title2 || ''}
                  onChange={(e) => updateData('title2', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-50"
                  placeholder="Enter second title..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                ref={editorRef}
                id={`ckeditor-${component.id || 'text-block'}`}
                defaultValue={componentData.content || ''}
                className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-50"
                placeholder="Enter your text content..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Alignment
                </label>
                <select
                  value={componentData.textAlign || 'left'}
                  onChange={(e) => updateData('textAlign', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <select
                  value={componentData.fontSize || 'text-base'}
                  onChange={(e) => updateData('fontSize', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="text-sm">Small</option>
                  <option value="text-base">Medium</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                  <option value="text-2xl">2X Large</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'image-block':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={componentData.imageUrl || ''}
                onChange={(e) => updateData('imageUrl', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-50"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={componentData.altText || ''}
                onChange={(e) => updateData('altText', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Descriptive text for the image"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <input
                type="text"
                value={componentData.caption || ''}
                onChange={(e) => updateData('caption', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Image caption"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <select
                  value={componentData.width || 'w-full'}
                  onChange={(e) => updateData('width', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="w-1/4">25%</option>
                  <option value="w-1/2">50%</option>
                  <option value="w-3/4">75%</option>
                  <option value="w-full">100%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alignment
                </label>
                <select
                  value={componentData.alignment || 'center'}
                  onChange={(e) => updateData('alignment', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'call-to-action':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={componentData.buttonText || ''}
                onChange={(e) => updateData('buttonText', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Click Here"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button URL
              </label>
              <input
                type="url"
                value={componentData.buttonUrl || ''}
                onChange={(e) => updateData('buttonUrl', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="https://example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Size
                </label>
                <select
                  value={componentData.buttonSize || 'medium'}
                  onChange={(e) => updateData('buttonSize', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Style
                </label>
                <select
                  value={componentData.buttonStyle || 'primary'}
                  onChange={(e) => updateData('buttonStyle', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'video-embed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={componentData.videoUrl || ''}
                onChange={(e) => updateData('videoUrl', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="YouTube or Vimeo URL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <select
                  value={componentData.aspectRatio || '16:9'}
                  onChange={(e) => updateData('aspectRatio', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="16:9">16:9</option>
                  <option value="4:3">4:3</option>
                  <option value="1:1">1:1</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={componentData.autoplay || false}
                    onChange={(e) => updateData('autoplay', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Autoplay</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'html-embed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Code
              </label>
              <textarea
                value={componentData.htmlCode || ''}
                onChange={(e) => updateData('htmlCode', e.target.value)}
                rows={8}
                className="w-full border border-blue-200 rounded-md px-3 py-2 font-mono text-sm text-gray-900 bg-blue-50"
                placeholder="<div>Your HTML code here...</div>"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Only paste HTML from trusted sources. Malicious code can harm your website.
              </p>
            </div>
          </div>
        );

      case 'product-grid':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Products
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={componentData.productCount || 6}
                onChange={(e) => updateData('productCount', parseInt(e.target.value))}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grid Columns
                </label>
                <select
                  value={componentData.columns || 3}
                  onChange={(e) => updateData('columns', parseInt(e.target.value))}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value={2}>2 Columns</option>
                  <option value={3}>3 Columns</option>
                  <option value={4}>4 Columns</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={componentData.showPrices || true}
                    onChange={(e) => updateData('showPrices', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Prices</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'hero-section':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={componentData.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={componentData.subtitle || ''}
                onChange={(e) => updateData('subtitle', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Enter subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={componentData.description || ''}
                onChange={(e) => updateData('description', e.target.value)}
                rows={3}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Enter description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Font Size
                </label>
                <select
                  value={componentData.titleFontSize || 'large'}
                  onChange={(e) => updateData('titleFontSize', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle Font Size
                </label>
                <select
                  value={componentData.subtitleFontSize || 'medium'}
                  onChange={(e) => updateData('subtitleFontSize', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description Font Size
                </label>
                <select
                  value={componentData.descriptionFontSize || 'base'}
                  onChange={(e) => updateData('descriptionFontSize', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="xlarge">Extra Large</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={componentData.primaryButtonText || ''}
                  onChange={(e) => updateData('primaryButtonText', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="Button text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={componentData.primaryButtonLink || ''}
                  onChange={(e) => updateData('primaryButtonLink', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="/page-link"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Alignment
                </label>
                <select
                  value={componentData.textAlignment || 'center'}
                  onChange={(e) => updateData('textAlignment', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <select
                  value={componentData.height || 'medium'}
                  onChange={(e) => updateData('height', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'about-us-section':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={componentData.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="About Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={componentData.content || ''}
                onChange={(e) => updateData('content', e.target.value)}
                rows={6}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Tell your story..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Layout
                </label>
                <select
                  value={componentData.layout || 'single-column'}
                  onChange={(e) => updateData('layout', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="single-column">Single Column</option>
                  <option value="two-column">Two Column</option>
                  <option value="image-left">Image Left</option>
                  <option value="image-right">Image Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Alignment
                </label>
                <select
                  value={componentData.textAlignment || 'left'}
                  onChange={(e) => updateData('textAlignment', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'call-to-action-section':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={componentData.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Call to Action Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={componentData.description || ''}
                onChange={(e) => updateData('description', e.target.value)}
                rows={3}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Compelling description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={componentData.buttonText || ''}
                  onChange={(e) => updateData('buttonText', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="Get Started"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Link
                </label>
                <input
                  type="text"
                  value={componentData.buttonLink || ''}
                  onChange={(e) => updateData('buttonLink', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="/contact"
                />
              </div>
            </div>
          </div>
        );

      case 'button-block':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={componentData.text || ''}
                onChange={(e) => updateData('text', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Button Text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Link
              </label>
              <input
                type="text"
                value={componentData.link || ''}
                onChange={(e) => updateData('link', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="/page-link"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select
                  value={componentData.size || 'medium'}
                  onChange={(e) => updateData('size', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style
                </label>
                <select
                  value={componentData.style || 'primary'}
                  onChange={(e) => updateData('style', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alignment
                </label>
                <select
                  value={componentData.alignment || 'center'}
                  onChange={(e) => updateData('alignment', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'contact-form':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Title
                </label>
                <input
                  type="text"
                  value={componentData.title || ''}
                  onChange={(e) => updateData('title', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="Contact Us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={componentData.subtitle || ''}
                  onChange={(e) => updateData('subtitle', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="Get in touch with us"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructional Text
              </label>
              <textarea
                value={componentData.instructionalText || ''}
                onChange={(e) => updateData('instructionalText', e.target.value)}
                rows={2}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Please enter the details of your request..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={componentData.buttonText || ''}
                  onChange={(e) => updateData('buttonText', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="Submit"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={componentData.showOrderNumber !== false}
                    onChange={(e) => updateData('showOrderNumber', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Order Number Field</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  value={componentData.backgroundColor || '#ffffff'}
                  onChange={(e) => updateData('backgroundColor', e.target.value)}
                  className="w-full h-10 border border-blue-200 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={componentData.textColor || '#374151'}
                  onChange={(e) => updateData('textColor', e.target.value)}
                  className="w-full h-10 border border-blue-200 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Color
                </label>
                <input
                  type="color"
                  value={componentData.buttonColor || '#dc2626'}
                  onChange={(e) => updateData('buttonColor', e.target.value)}
                  className="w-full h-10 border border-blue-200 rounded-md cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      case 'faq-section':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={componentData.title || ''}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Frequently Asked Questions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={componentData.description || ''}
                onChange={(e) => updateData('description', e.target.value)}
                rows={2}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Find answers to common questions..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={componentData.showSearch || false}
                    onChange={(e) => updateData('showSearch', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Search</span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={componentData.showCategories || false}
                    onChange={(e) => updateData('showCategories', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Categories</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'contact-form':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={componentData.title || 'Contact Us'}
                onChange={(e) => updateData('title', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Contact Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={componentData.subtitle || 'Get in touch with our support team'}
                onChange={(e) => updateData('subtitle', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Get in touch with our support team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructional Text
              </label>
              <textarea
                value={componentData.instructionalText || 'Please fill out the form below and we\'ll get back to you as soon as possible.'}
                onChange={(e) => updateData('instructionalText', e.target.value)}
                rows={3}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Instructions for users..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={componentData.buttonText || 'Send Message'}
                onChange={(e) => updateData('buttonText', e.target.value)}
                className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                placeholder="Send Message"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={componentData.showOrderNumber !== false}
                    onChange={(e) => updateData('showOrderNumber', e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Order Number Field</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <select
                  value={componentData.backgroundColor || 'bg-white'}
                  onChange={(e) => updateData('backgroundColor', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="bg-white">White</option>
                  <option value="bg-gray-50">Light Gray</option>
                  <option value="bg-blue-50">Light Blue</option>
                  <option value="bg-green-50">Light Green</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <select
                  value={componentData.textColor || 'text-gray-900'}
                  onChange={(e) => updateData('textColor', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                >
                  <option value="text-gray-900">Dark Gray</option>
                  <option value="text-black">Black</option>
                  <option value="text-white">White</option>
                  <option value="text-blue-900">Dark Blue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Color
                </label>
                <input
                  type="text"
                  value={componentData.buttonColor || 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'}
                  onChange={(e) => updateData('buttonColor', e.target.value)}
                  className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
                  placeholder="CSS color or gradient"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-600">No configuration options available for this component type.</p>
          </div>
        );
    }
  };

  const renderStyleTab = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margin Top
            </label>
            <select
              value={componentData.marginTop || 'mt-6'}
              onChange={(e) => updateData('marginTop', e.target.value)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
            >
              <option value="mt-0">None</option>
              <option value="mt-2">Small</option>
              <option value="mt-4">Medium</option>
              <option value="mt-6">Large</option>
              <option value="mt-8">Extra Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margin Bottom
            </label>
            <select
              value={componentData.marginBottom || 'mb-6'}
              onChange={(e) => updateData('marginBottom', e.target.value)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
            >
              <option value="mb-0">None</option>
              <option value="mb-2">Small</option>
              <option value="mb-4">Medium</option>
              <option value="mb-6">Large</option>
              <option value="mb-8">Extra Large</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding
            </label>
            <select
              value={componentData.padding || 'p-4'}
              onChange={(e) => updateData('padding', e.target.value)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
            >
              <option value="p-0">None</option>
              <option value="p-2">Small</option>
              <option value="p-4">Medium</option>
              <option value="p-6">Large</option>
              <option value="p-8">Extra Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <select
              value={componentData.backgroundColor || 'bg-transparent'}
              onChange={(e) => updateData('backgroundColor', e.target.value)}
              className="w-full border border-blue-200 rounded-md px-3 py-2 text-gray-900 bg-blue-50"
            >
              <option value="bg-transparent">Transparent</option>
              <option value="bg-white">White</option>
              <option value="bg-gray-50">Light Gray</option>
              <option value="bg-blue-50">Light Blue</option>
              <option value="bg-green-50">Light Green</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Component</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'style'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Style
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'style' && renderStyleTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentEditor;