/**
 * Admin Plugin Card Component
 * Dedicated component for admin area with proper dark text styling
 */
import { useState } from 'react';

export default function AdminPluginCard({ plugin, onEdit, onSave, saving, editingPlugin, editFormData, setEditFormData }) {
  const [showSettings, setShowSettings] = useState(false);

  const handleEdit = () => {
    onEdit(plugin.key);
    setShowSettings(true);
  };

  const handleCancel = () => {
    onEdit(null);
    setShowSettings(false);
  };

  const handleSave = async () => {
    await onSave();
    setShowSettings(false);
  };

  const isEditing = editingPlugin === plugin.key;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Plugin Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {plugin.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
              <p className="text-sm text-gray-600">{plugin.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              plugin.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {plugin.status}
            </span>
            
            {/* Mode Badge */}
            {plugin.has_mode && plugin.mode && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                plugin.mode === 'test'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {plugin.mode}
              </span>
            )}
          </div>
        </div>

        {/* Plugin Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>{plugin.setting_count || 0} settings configured</span>
          {plugin.last_updated && (
            <span>Updated {new Date(plugin.last_updated).toLocaleDateString()}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                {showSettings ? 'Hide' : 'View'} Settings
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Configure
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                {saving && (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          )}
        </div>

        {/* Settings Panel */}
        {(showSettings || isEditing) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {isEditing ? (
              <AdminPluginForm 
                plugin={plugin}
                formData={editFormData}
                setFormData={setEditFormData}
              />
            ) : (
              <AdminPluginSettings plugin={plugin} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Display Component
function AdminPluginSettings({ plugin }) {
  const requiredSettings = plugin.has_mode 
    ? plugin.required_settings[plugin.mode] || plugin.required_settings.default || []
    : plugin.required_settings.default || [];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">Required Settings</h4>
      <div className="grid grid-cols-1 gap-2">
        {requiredSettings.map((setting) => (
          <div key={setting} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700 font-medium">
              {setting.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Configured
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Form Component  
function AdminPluginForm({ plugin, formData, setFormData }) {
  const requiredSettings = plugin.has_mode 
    ? plugin.required_settings[formData.mode || plugin.mode] || plugin.required_settings.default || []
    : plugin.required_settings.default || [];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      {plugin.has_mode && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="test"
                checked={formData.mode === 'test'}
                onChange={(e) => handleInputChange('mode', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Test</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mode"
                value="live"
                checked={formData.mode === 'live'}
                onChange={(e) => handleInputChange('mode', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Live</span>
            </label>
          </div>
        </div>
      )}

      {/* Dynamic Settings Fields */}
      {requiredSettings.map((setting) => (
        <div key={setting}>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            {setting.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <input
            type={setting.includes('secret') || setting.includes('key') ? 'password' : 'text'}
            value={formData[setting] || ''}
            onChange={(e) => handleInputChange(setting, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            placeholder={`Enter ${setting.replace(/_/g, ' ')}`}
          />
        </div>
      ))}
    </div>
  );
}