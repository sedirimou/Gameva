import React, { useState, useEffect } from 'react';
import { componentRegistry } from '../static-page-components';
import { handleApiError, handleApiSuccess } from '../../lib/errorHandler';

export default function PageBuilder({ pageData, onSave }) {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showComponentPanel, setShowComponentPanel] = useState(false);

  useEffect(() => {
    if (pageData?.content_json) {
      setComponents(Array.isArray(pageData.content_json) ? pageData.content_json : []);
    }
  }, [pageData]);

  const handleReorder = (fromIndex, toIndex) => {
    const items = Array.from(components);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);
    setComponents(items);
  };

  const addComponent = (componentType) => {
    const componentConfig = componentRegistry[componentType];
    if (!componentConfig) return;

    const newComponent = {
      type: componentType,
      data: getDefaultData(componentConfig.fields)
    };

    setComponents([...components, newComponent]);
    setEditingIndex(components.length);
    setSelectedComponent(newComponent);
    setShowComponentPanel(false);
  };

  const getDefaultData = (fields) => {
    const data = {};
    fields.forEach(field => {
      if (field.type === 'array') {
        data[field.name] = [];
      } else if (field.type === 'checkbox') {
        data[field.name] = field.default || false;
      } else {
        data[field.name] = field.default || '';
      }
    });
    return data;
  };

  const updateComponent = (index, newData) => {
    const updatedComponents = [...components];
    updatedComponents[index] = { ...updatedComponents[index], data: newData };
    setComponents(updatedComponents);
  };

  const deleteComponent = (index) => {
    const updatedComponents = components.filter((_, i) => i !== index);
    setComponents(updatedComponents);
    if (editingIndex === index) {
      setEditingIndex(null);
      setSelectedComponent(null);
    }
  };

  const duplicateComponent = (index) => {
    const componentToDuplicate = components[index];
    const duplicatedComponent = JSON.parse(JSON.stringify(componentToDuplicate));
    const updatedComponents = [...components];
    updatedComponents.splice(index + 1, 0, duplicatedComponent);
    setComponents(updatedComponents);
  };

  const moveComponent = (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === components.length - 1)
    ) {
      return;
    }

    const updatedComponents = [...components];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedComponents[index], updatedComponents[newIndex]] = [updatedComponents[newIndex], updatedComponents[index]];
    setComponents(updatedComponents);
  };

  const saveComponents = async () => {
    if (onSave) {
      await onSave(components);
    }
  };

  const categorizedComponents = Object.entries(componentRegistry).reduce((acc, [key, config]) => {
    const category = config.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...config });
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Page Content Builder</h3>
            <p className="text-gray-600 mt-1">Drag and drop components to build your page</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowComponentPanel(!showComponentPanel)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Component
            </button>
            <button
              onClick={saveComponents}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Component Panel */}
        {showComponentPanel && (
          <div className="w-80 border-r border-gray-200 p-4">
            <h4 className="font-semibold text-gray-900 mb-4">Available Components</h4>
            <div className="space-y-4">
              {Object.entries(categorizedComponents).map(([category, components]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {components.map((component) => (
                      <button
                        key={component.key}
                        onClick={() => addComponent(component.key)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="text-lg mb-1">{component.icon}</div>
                        <div className="text-xs font-medium text-gray-900">{component.displayName}</div>
                        <div className="text-xs text-gray-500 mt-1">{component.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex">
          {/* Components List */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {components.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No components yet</h3>
                  <p className="text-gray-500 mb-4">Start building your page by adding components</p>
                  <button
                    onClick={() => setShowComponentPanel(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Component
                  </button>
                </div>
              ) : (
                components.map((component, index) => {
                  const config = componentRegistry[component.type];
                  return (
                    <div
                      key={index}
                      className={`bg-gray-50 border rounded-lg p-4 ${
                        editingIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">{config?.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">{config?.displayName}</div>
                            <div className="text-sm text-gray-500">{config?.description}</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => moveComponent(index, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveComponent(index, 'down')}
                            disabled={index === components.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => {
                              setEditingIndex(index);
                              setSelectedComponent(component);
                            }}
                            className="text-blue-500 hover:text-blue-600 p-1"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => duplicateComponent(index)}
                            className="text-green-500 hover:text-green-600 p-1"
                            title="Duplicate"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => deleteComponent(index)}
                            className="text-red-500 hover:text-red-600 p-1"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {/* Component Preview */}
                      <div className="bg-white rounded border p-3">
                        <ComponentPreview component={component} config={config} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Component Editor */}
          {selectedComponent && editingIndex !== null && (
            <div className="w-96 border-l border-gray-200 p-6 bg-gray-50">
              <ComponentEditor
                component={selectedComponent}
                config={componentRegistry[selectedComponent.type]}
                onUpdate={(newData) => updateComponent(editingIndex, newData)}
                onClose={() => {
                  setEditingIndex(null);
                  setSelectedComponent(null);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Component Preview
function ComponentPreview({ component, config }) {
  if (!component || !config) return <div className="text-gray-500">Invalid component</div>;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Preview:</div>
      <div className="text-sm text-gray-600">
        {Object.entries(component.data).slice(0, 3).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium">{key}:</span> {
              typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? '...' : '') :
              Array.isArray(value) ? `${value.length} items` :
              typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
              JSON.stringify(value)
            }
          </div>
        ))}
      </div>
    </div>
  );
}

// Component Editor
function ComponentEditor({ component, config, onUpdate, onClose }) {
  const [formData, setFormData] = useState(component.data);

  const handleFieldChange = (fieldName, value) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const renderField = (field) => {
    const value = formData[field.name] || field.default || '';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {field.label}
            </span>
          </label>
        );

      case 'array':
        return (
          <div className="space-y-2">
            {(value || []).map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={typeof item === 'string' ? item : item[field.fields?.[0]?.name] || ''}
                  onChange={(e) => {
                    const newArray = [...(value || [])];
                    if (typeof item === 'string') {
                      newArray[index] = e.target.value;
                    } else {
                      newArray[index] = { ...item, [field.fields[0].name]: e.target.value };
                    }
                    handleFieldChange(field.name, newArray);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <button
                  onClick={() => {
                    const newArray = (value || []).filter((_, i) => i !== index);
                    handleFieldChange(field.name, newArray);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newArray = [...(value || [])];
                newArray.push(field.fields ? {} : '');
                handleFieldChange(field.name, newArray);
              }}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              + Add Item
            </button>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Edit {config.displayName}</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
    </div>
  );
}