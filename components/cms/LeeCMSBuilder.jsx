/**
 * LeeCMS Page Builder - Main Builder Interface
 * Comprehensive modular CMS with row-based layout system
 */
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEye, 
  faEdit, 
  faSave, 
  faUndo, 
  faRedo,
  faColumns,
  faCog,
  faTrash,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import RowLayout from './RowLayout';
import { componentRegistry } from './CMSComponent';

const LeeCMSBuilder = ({ 
  initialContent = [], 
  onSave, 
  onPreview, 
  isPreviewMode = false,
  pageData = {}
}) => {
  const [rows, setRows] = useState(initialContent);
  const [selectedRowType, setSelectedRowType] = useState('100');
  const [showRowSelector, setShowRowSelector] = useState(false);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [targetRow, setTargetRow] = useState(null);
  const [targetColumn, setTargetColumn] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Layout configurations
  const rowLayouts = [
    { id: '100', name: 'Single Column', description: '100%', icon: '█' },
    { id: '50-50', name: 'Two Columns Equal', description: '50% | 50%', icon: '█ █' },
    { id: '70-30', name: 'Two Columns Left Heavy', description: '70% | 30%', icon: '██ █' },
    { id: '30-70', name: 'Two Columns Right Heavy', description: '30% | 70%', icon: '█ ██' },
    { id: '33-33-33', name: 'Three Columns Equal', description: '33% | 33% | 33%', icon: '█ █ █' }
  ];

  // Initialize with content from database
  useEffect(() => {
    console.log('LeeCMS Builder initializing with content:', initialContent);
    if (initialContent && initialContent.length > 0) {
      setRows(initialContent);
      console.log('Setting rows to:', initialContent);
    } else {
      console.log('No initial content, starting with empty state');
      setRows([]);
    }
  }, [initialContent]);

  // Track changes for unsaved indicator
  useEffect(() => {
    if (rows.length > 0 || JSON.stringify(rows) !== JSON.stringify(initialContent)) {
      setHasUnsavedChanges(true);
    }
  }, [rows, initialContent]);

  // Save to history for undo/redo
  const saveToHistory = (newRows) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newRows)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Add new row
  const addRow = (layoutType) => {
    const newRow = {
      id: `row_${Date.now()}`,
      layout: layoutType,
      components: {},
      backgroundColor: 'transparent',
      padding: '1rem',
      marginTop: '0',
      marginBottom: '2rem'
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    saveToHistory(updatedRows);
    setShowRowSelector(false);
  };

  // Delete row
  const deleteRow = (rowIndex) => {
    if (confirm('Are you sure you want to delete this row and all its components?')) {
      const updatedRows = rows.filter((_, index) => index !== rowIndex);
      setRows(updatedRows);
      saveToHistory(updatedRows);
    }
  };

  // Move row up/down
  const moveRow = (rowIndex, direction) => {
    const newIndex = direction === 'up' ? rowIndex - 1 : rowIndex + 1;
    if (newIndex < 0 || newIndex >= rows.length) return;

    const updatedRows = [...rows];
    const [movedRow] = updatedRows.splice(rowIndex, 1);
    updatedRows.splice(newIndex, 0, movedRow);
    setRows(updatedRows);
    saveToHistory(updatedRows);
  };

  // Update row
  const updateRow = (rowIndex, updatedRow) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = updatedRow;
    setRows(updatedRows);
    saveToHistory(updatedRows);
  };

  // Add component to row/column
  const addComponent = (rowIndex, columnIndex) => {
    setTargetRow(rowIndex);
    setTargetColumn(columnIndex);
    setShowComponentSelector(true);
  };

  // Handle component selection
  const handleComponentSelect = (componentType) => {
    if (targetRow === null || targetColumn === null) return;

    const newComponent = {
      id: `component_${Date.now()}`,
      type: componentType,
      data: getDefaultComponentData(componentType)
    };

    const updatedRows = [...rows];
    const colKey = `col_${targetColumn + 1}`;
    
    // Ensure the row and components object exist
    if (!updatedRows[targetRow]) {
      console.error('Target row does not exist:', targetRow);
      return;
    }
    
    if (!updatedRows[targetRow].components) {
      updatedRows[targetRow].components = {};
    }
    
    if (!updatedRows[targetRow].components[colKey]) {
      updatedRows[targetRow].components[colKey] = [];
    }
    
    updatedRows[targetRow].components[colKey].push(newComponent);
    
    setRows(updatedRows);
    saveToHistory(updatedRows);
    setShowComponentSelector(false);
    setTargetRow(null);
    setTargetColumn(null);
  };

  // Get default data for new components
  const getDefaultComponentData = (componentType) => {
    const defaults = {
      'text-block': {
        content: 'Enter your text content here...',
        textAlign: 'left',
        fontSize: 'text-base'
      },
      'image-block': {
        imageUrl: '',
        altText: '',
        caption: '',
        width: 'w-full',
        alignment: 'center'
      },
      'call-to-action': {
        buttonText: 'Click Me',
        linkUrl: '#',
        buttonStyle: 'primary',
        buttonSize: 'md',
        alignment: 'center'
      },
      'video-embed': {
        videoUrl: '',
        aspectRatio: '16:9',
        alignment: 'center'
      },
      'html-embed': {
        htmlContent: '<div>Your HTML content here...</div>'
      },
      'product-grid': {
        title: 'Featured Products',
        displayType: 'latest',
        count: '8',
        columns: '4',
        showPrices: true
      }
    };

    return defaults[componentType] || {};
  };

  // Undo/Redo functionality
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setRows(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setRows(history[historyIndex + 1]);
    }
  };

  // Save content
  const handleSave = () => {
    if (onSave) {
      onSave(rows);
      setHasUnsavedChanges(false);
    }
  };

  // Preview mode
  const handlePreview = () => {
    if (onPreview) {
      onPreview(!isPreviewMode);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="leecms-preview">
        {rows.map((row, index) => (
          <RowLayout
            key={row.id || index}
            row={row}
            rowIndex={index}
            isEditing={false}
          />
        ))}
        
        {rows.length === 0 && (
          <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold mb-2">Empty Page</h2>
              <p className="text-gray-400">Exit preview mode to start building your page</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="leecms-builder">
      {/* Builder Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              LeeCMS Page Builder
              {hasUnsavedChanges && (
                <span className="ml-2 text-sm text-amber-600">• Unsaved changes</span>
              )}
            </h2>
            
            <div className="flex items-center space-x-2">
              {/* Add Row Button */}
              <button
                onClick={() => setShowRowSelector(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                <span>Add Row</span>
              </button>

              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <FontAwesomeIcon icon={faUndo} className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <FontAwesomeIcon icon={faRedo} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Preview Toggle */}
            <button
              onClick={handlePreview}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
              <span>Preview</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faSave} className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="p-6 bg-gray-50 min-h-screen">
        {rows.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Building Your Page</h2>
              <p className="text-gray-500 mb-6">Add your first row to begin creating content</p>
              <button
                onClick={() => setShowRowSelector(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Your First Row</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {rows.map((row, index) => (
              <RowLayout
                key={row.id || index}
                row={row}
                rowIndex={index}
                onUpdateRow={updateRow}
                onDeleteRow={deleteRow}
                onAddComponent={addComponent}
                onMoveRow={moveRow}
                isEditing={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Row Layout Selector Modal */}
      {showRowSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Choose Row Layout</h3>
              <p className="text-gray-500 mt-1">Select the column layout for your new row</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rowLayouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => addRow(layout.id)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl font-mono text-gray-600">
                        {layout.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{layout.name}</div>
                        <div className="text-sm text-gray-500">{layout.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRowSelector(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Selector Modal */}
      {showComponentSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">Add Component</h3>
              <p className="text-gray-500 mt-1">Choose a component to add to your page</p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                Total Components: {Object.keys(componentRegistry).length} | 
                Registry Keys: {Object.keys(componentRegistry).slice(0, 5).join(', ')}...
              </div>
              
              {/* Group components by category */}
              {(() => {
                const groupedComponents = {};
                Object.entries(componentRegistry).forEach(([key, config]) => {
                  const category = config.category || 'Basic';
                  if (!groupedComponents[category]) {
                    groupedComponents[category] = [];
                  }
                  groupedComponents[category].push([key, config]);
                });

                console.log('🔧 Component Registry:', componentRegistry);
                console.log('🔧 Grouped Components:', groupedComponents);

                return Object.entries(groupedComponents).map(([category, components]) => (
                  <div key={category} className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {category} Components ({components.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {components.map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => handleComponentSelect(key)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="font-medium text-gray-900 mb-1">{config.name}</div>
                          <div className="text-xs text-gray-500">{config.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setShowComponentSelector(false);
                  setTargetRow(null);
                  setTargetColumn(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeeCMSBuilder;