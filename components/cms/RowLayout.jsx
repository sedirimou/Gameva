/**
 * RowLayout Component - Handles row structure and column layouts for LeeCMS
 */
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faArrowUp, 
  faArrowDown, 
  faCog,
  faEye 
} from '@fortawesome/free-solid-svg-icons';
import ComponentRenderer from './ComponentRenderer';

const RowLayout = ({ 
  row, 
  rowIndex, 
  onUpdateRow, 
  onDeleteRow, 
  onAddComponent, 
  onMoveRow, 
  isEditing = true 
}) => {
  const [showRowSettings, setShowRowSettings] = useState(false);

  // Get column configuration based on layout
  const getColumnConfig = (layout) => {
    const configs = {
      '100': [{ width: 'w-full', label: 'Column 1' }],
      '50-50': [
        { width: 'w-1/2', label: 'Column 1' },
        { width: 'w-1/2', label: 'Column 2' }
      ],
      '70-30': [
        { width: 'w-7/10', label: 'Column 1 (70%)' },
        { width: 'w-3/10', label: 'Column 2 (30%)' }
      ],
      '30-70': [
        { width: 'w-3/10', label: 'Column 1 (30%)' },
        { width: 'w-7/10', label: 'Column 2 (70%)' }
      ],
      '33-33-33': [
        { width: 'w-1/3', label: 'Column 1' },
        { width: 'w-1/3', label: 'Column 2' },
        { width: 'w-1/3', label: 'Column 3' }
      ]
    };
    return configs[layout] || configs['100'];
  };

  const columnConfig = getColumnConfig(row.layout);

  // Row settings update
  const updateRowSettings = (updates) => {
    if (onUpdateRow) {
      onUpdateRow(rowIndex, { ...row, ...updates });
    }
  };

  // Convert margin/padding values to CSS
  const convertSpacingValue = (value) => {
    const conversions = {
      'None': '0',
      'Small': '1rem',
      'Medium': '2rem',
      'Large': '3rem',
      'Extra Large': '4rem'
    };
    return conversions[value] || value || '0';
  };

  // Row styles - Force transparent background and white text
  const rowStyles = {
    backgroundColor: 'transparent',
    padding: convertSpacingValue(row.padding) || '1rem',
    marginTop: convertSpacingValue(row.marginTop) || '0',
    marginBottom: convertSpacingValue(row.marginBottom) || '2rem'
  };

  if (!isEditing) {
    // Frontend display mode
    return (
      <div 
        className="row-layout text-white"
        style={rowStyles}
      >
        <div className={`flex ${row.layout && row.layout.includes('33') ? 'flex-wrap lg:flex-nowrap' : ''} gap-12`}>
          {columnConfig.map((col, colIndex) => {
            const colKey = `col_${colIndex + 1}`;
            const columnComponents = row.components && row.components[colKey] ? row.components[colKey] : [];
            
            return (
              <div key={colIndex} className={`${col.width} min-h-[20px]`}>
                {columnComponents.map((component, compIndex) => (
                  <ComponentRenderer 
                    key={component.id || compIndex}
                    component={component}
                    isEditing={false}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Editing mode
  return (
    <div className="row-layout-editor bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
      {/* Row Controls */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            Row {rowIndex + 1} ({row.layout ? row.layout.replace('-', ' / ') : 'Default Layout'})
          </span>
          <span className="text-xs text-gray-500">
            {columnConfig.length} column{columnConfig.length > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Row Settings */}
          <button
            onClick={() => setShowRowSettings(!showRowSettings)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Row Settings"
          >
            <FontAwesomeIcon icon={faCog} className="w-3 h-3" />
          </button>

          {/* Move Up */}
          <button
            onClick={() => onMoveRow && onMoveRow(rowIndex, 'up')}
            disabled={rowIndex === 0}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 rounded"
            title="Move Up"
          >
            <FontAwesomeIcon icon={faArrowUp} className="w-3 h-3" />
          </button>

          {/* Move Down */}
          <button
            onClick={() => onMoveRow && onMoveRow(rowIndex, 'down')}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Move Down"
          >
            <FontAwesomeIcon icon={faArrowDown} className="w-3 h-3" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDeleteRow && onDeleteRow(rowIndex)}
            className="p-1 text-red-500 hover:text-red-700 rounded"
            title="Delete Row"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Row Settings Panel */}
      {showRowSettings && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-bold text-black mb-3">Row Settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Background
              </label>
              <select
                value={row.backgroundColor || 'transparent'}
                onChange={(e) => updateRowSettings({ backgroundColor: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
              >
                <option value="transparent">Transparent</option>
                <option value="#ffffff">White</option>
                <option value="#f8fafc">Light Gray</option>
                <option value="#1f2937">Dark Gray</option>
                <option value="#153e8f">Blue</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Padding
              </label>
              <select
                value={row.padding || '1rem'}
                onChange={(e) => updateRowSettings({ padding: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
              >
                <option value="0">None</option>
                <option value="0.5rem">Small</option>
                <option value="1rem">Medium</option>
                <option value="2rem">Large</option>
                <option value="3rem">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Top Margin
              </label>
              <select
                value={row.marginTop || '0'}
                onChange={(e) => updateRowSettings({ marginTop: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
              >
                <option value="0">None</option>
                <option value="1rem">Small</option>
                <option value="2rem">Medium</option>
                <option value="3rem">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Bottom Margin
              </label>
              <select
                value={row.marginBottom || '2rem'}
                onChange={(e) => updateRowSettings({ marginBottom: e.target.value })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white"
              >
                <option value="0">None</option>
                <option value="1rem">Small</option>
                <option value="2rem">Medium</option>
                <option value="3rem">Large</option>
                <option value="4rem">Extra Large</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Column Layout */}
      <div 
        className="p-4"
        style={rowStyles}
      >
        <div className={`flex ${row.layout && row.layout.includes('33') ? 'flex-wrap lg:flex-nowrap' : ''} gap-8`}>
          {columnConfig.map((col, colIndex) => (
            <div 
              key={colIndex} 
              className={`${col.width} min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg relative group hover:border-blue-400 transition-colors`}
            >
              {/* Column Label */}
              <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                {col.label}
              </div>

              {/* Add Component Button */}
              <button
                onClick={() => onAddComponent && onAddComponent(rowIndex, colIndex)}
                className="absolute inset-0 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={faPlus} className="w-6 h-6 mb-2" />
                  <span className="text-sm">Add Component</span>
                </div>
              </button>

              {/* Existing Components */}
              {(() => {
                const colKey = `col_${colIndex + 1}`;
                const columnComponents = row.components && row.components[colKey] ? row.components[colKey] : [];
                
                return columnComponents.length > 0 && (
                  <div className="space-y-4 p-4">
                    {columnComponents.map((component, compIndex) => (
                      <ComponentRenderer 
                        key={component.id || compIndex}
                        component={component}
                        isEditing={true}
                        onUpdate={(updatedComponent) => {
                          const updatedComponents = { ...row.components };
                          updatedComponents[colKey][compIndex] = updatedComponent;
                          updateRowSettings({ components: updatedComponents });
                        }}
                        onDelete={() => {
                          const updatedComponents = { ...row.components };
                          updatedComponents[colKey].splice(compIndex, 1);
                          updateRowSettings({ components: updatedComponents });
                        }}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RowLayout;