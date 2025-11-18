import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';

export default function KinguinImportCenter() {
  // State for all sections
  const [settings, setSettings] = useState({
    api_key: '4d80753aff63f60103eb0764f881cd03',
    api_url: 'https://gateway.kinguin.net/esa/api/v1/products',
    platforms: [],
    genres: [],
    tags: [],
    minimum_price: 0,
    auto_update: false
  });
  
  const [commissionTiers, setCommissionTiers] = useState([]);
  const [importStatus, setImportStatus] = useState({
    total_products: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    current_page: 0,
    status: 'Idle'
  });
  const [logs, setLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Never');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Available options for filters (from official Kinguin API documentation)
  const platformOptions = [
    'PC Battle.net', 'PC Epic Games', 'PC GOG', 'PC Mog Station', 'PC Digital Download',
    'EA App', 'PC Rockstar Games', 'PC Steam', 'PC Ubisoft Connect', 'PC', '2DS'
  ];
  
  const genreOptions = [
    'Action', 'Adventure', 'Anime', 'Casual', 'Co-op', 'Dating Simulator', 'Fighting', 'FPS',
    'Hack and Slash', 'Hidden Object', 'Horror', 'Indie', 'Life Simulation', 'MMO',
    'Music / Soundtrack', 'Online Courses', 'Open World', 'Platformer', 'Point & click',
    'PSN Card', 'Puzzle', 'Racing', 'RPG', 'Simulation', 'Software', 'Sport', 'Story rich',
    'Strategy', 'Subscription', 'Survival', 'Third-Person Shooter', 'Visual Novel', 'VR Games',
    'XBOX LIVE Gold Card', 'XBOX LIVE Points'
  ];
  
  const tagOptions = [
    'indie valley',
    'dlc',
    'base',
    'software',
    'prepaid'
  ];

  // Load initial data and set up polling
  useEffect(() => {
    loadData();
    
    // Set up polling for live updates every 2 seconds
    const interval = setInterval(() => {
      loadImportStatus();
      loadLogs();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load settings, commission tiers, and import status
      const [settingsRes, tiersRes, statusRes] = await Promise.all([
        fetch('/api/kinguin-import/settings'),
        fetch('/api/kinguin-import/commission-tiers'),
        fetch('/api/kinguin-import/status')
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setSettings(settingsData.data);
        }
      }

      if (tiersRes.ok) {
        const tiersData = await tiersRes.json();
        if (tiersData.success) {
          setCommissionTiers(tiersData.data);
        }
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.success) {
          setImportStatus(statusData.data);
        }
      }

      // Load recent logs
      loadLogs();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/kinguin-import/logs');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLogs(data.logs);
        }
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadImportStatus = async () => {
    try {
      const response = await fetch('/api/kinguin-import/status');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setImportStatus(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading import status:', error);
    }
  };

  // Handle settings save
  const saveSettings = async () => {
    try {
      const response = await fetch('/api/kinguin-import/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        showNotification('Settings saved successfully!', 'success');
      } else {
        showNotification('Error saving settings: ' + data.message, 'error');
      }
    } catch (error) {
      showNotification('Error saving settings: ' + error.message, 'error');
    }
  };

  // Handle test connection
  const testConnection = async () => {
    try {
      setConnectionStatus('Testing...');
      const response = await fetch('/api/kinguin-import/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: settings.api_key, api_url: settings.api_url })
      });

      const data = await response.json();
      if (data.success) {
        setConnectionStatus('Connected');
      } else {
        setConnectionStatus('Failed');
      }
    } catch (error) {
      setConnectionStatus('Failed');
    }
  };

  // Handle commission tiers
  const addCommissionTier = () => {
    const newTier = {
      id: Date.now(),
      min_price: 0,
      max_price: 5,
      type: 'Fixed',
      rate: 1.5
    };
    setCommissionTiers([...commissionTiers, newTier]);
  };

  const removeCommissionTier = (id) => {
    const updatedTiers = commissionTiers.filter(tier => tier.id !== id);
    setCommissionTiers(updatedTiers);
    console.log(`🗑️ Removed commission tier ${id} (unsaved)`);
  };

  const updateCommissionTier = (id, field, value) => {
    // Update local state only - user controls when to save
    const updatedTiers = commissionTiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    );
    setCommissionTiers(updatedTiers);
    console.log(`📝 Modified commission tier ${id} field ${field} = ${value} (unsaved)`);
  };

  const saveCommissionTiers = async () => {
    try {
      console.log('💾 SAVE BUTTON CLICKED - Current commission tiers:', commissionTiers);
      console.log('💾 Number of tiers to save:', commissionTiers.length);
      
      // Validate data before sending
      for (let i = 0; i < commissionTiers.length; i++) {
        const tier = commissionTiers[i];
        console.log(`Tier ${i + 1}:`, tier);
        if (!tier.min_price || !tier.max_price || !tier.type || !tier.rate) {
          throw new Error(`Tier ${i + 1} is missing required fields`);
        }
      }
      
      const response = await fetch('/api/kinguin-import/commission-tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers: commissionTiers })
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('✅ Save response from database:', data);
      
      if (data.success) {
        showNotification(`Successfully saved ${data.data?.length || commissionTiers.length} commission tiers to database!`, 'success');
        
        // Reload the commission tiers from database to confirm save
        console.log('🔄 Reloading commission tiers from database...');
        const tiersResponse = await fetch('/api/kinguin-import/commission-tiers');
        if (tiersResponse.ok) {
          const tiersData = await tiersResponse.json();
          if (tiersData.success) {
            console.log('🔄 Reloaded commission tiers from kinguin_commission_tiers:', tiersData.data);
            setCommissionTiers(tiersData.data);
          }
        }
      } else {
        showNotification('Database error: ' + data.message, 'error');
        console.error('❌ Save failed:', data);
      }
    } catch (error) {
      console.error('❌ Error saving commission tiers:', error);
      showNotification('Error: ' + error.message, 'error');
    }
  };

  // Handle import controls
  const handleImportAction = async (action) => {
    try {
      let response;
      
      // Handle bulk price update separately since it uses a different endpoint
      if (action === 'bulk-price-update') {
        showNotification('Starting bulk price update for all products...', 'info');
        response = await fetch('/api/admin/bulk-price-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = await fetch('/api/kinguin-import/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
      }

      const data = await response.json();
      if (data.success) {
        if (action === 'bulk-price-update') {
          showNotification(`✅ Bulk price update completed: ${data.data.updatedCount} products updated`, 'success');
        } else {
          showNotification(data.message, 'success');
        }
        // Immediately refresh status after action
        loadImportStatus();
        loadLogs();
      } else {
        showNotification('Error: ' + data.message, 'error');
      }
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    }
  };

  // Handle platform/genre/tag selection
  const handleMultiSelect = (field, value) => {
    const currentValues = settings[field] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    setSettings({ ...settings, [field]: newValues });
  };

  const removeTag = (field, value) => {
    const newValues = settings[field].filter(v => v !== value);
    setSettings({ ...settings, [field]: newValues });
  };

  // Notification system
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (loading) {
    return (
      <AdminLayout title="Kinguin Import Center - Admin" currentPage="Kinguin Import Center">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Kinguin Import Center - Admin</title>
        <meta name="description" content="Kinguin Import Center for managing product imports" />
      </Head>

      <AdminLayout currentPage="Kinguin Import Center">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm font-medium">{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold mb-2">Kinguin Import Center</h1>
                <p className="text-purple-100">Manage your gaming product imports from Kinguin API</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-100">Connection Status</div>
                <div className="text-lg font-semibold">{connectionStatus}</div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-black">{importStatus.total_products}</div>
              <div className="text-black">Total Products</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{importStatus.imported}</div>
              <div className="text-black">Imported</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{importStatus.status}</div>
              <div className="text-black">Import Status</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-black">Never</div>
              <div className="text-black">Last Update</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Section 1: API Configuration */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-black">API Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="4d80753aff63f60103eb0764f881cd03"
                      value={settings.api_key}
                      onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm text-black"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={settings.api_url}
                      onChange={(e) => setSettings({...settings, api_url: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm text-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={testConnection}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={saveSettings}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Import Filter */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-black">Import Filter</h2>
                <div className="space-y-4">
                  {/* Platforms */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Platforms</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.platforms?.map(platform => (
                        <span key={platform} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                          {platform}
                          <button onClick={() => removeTag('platforms', platform)} className="ml-1 text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => handleMultiSelect('platforms', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      value=""
                    >
                      <option value="">Select Platform</option>
                      {platformOptions.filter(p => !settings.platforms?.includes(p)).map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Genres</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.genres?.map(genre => (
                        <span key={genre} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                          {genre}
                          <button onClick={() => removeTag('genres', genre)} className="ml-1 text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => handleMultiSelect('genres', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      value=""
                    >
                      <option value="">Select Genre</option>
                      {genreOptions.filter(g => !settings.genres?.includes(g)).map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Tag</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {settings.tags?.map(tag => (
                        <span key={tag} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center">
                          {tag}
                          <button onClick={() => removeTag('tags', tag)} className="ml-1 text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => handleMultiSelect('tags', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      value=""
                    >
                      <option value="">Select Tag</option>
                      {tagOptions.filter(t => !settings.tags?.includes(t)).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>

                  {/* Minimum Price */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-black">Minimum Price (€)</label>
                    <input
                      type="number"
                      value={settings.minimum_price}
                      onChange={(e) => setSettings({...settings, minimum_price: parseFloat(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      step="0.01"
                    />
                  </div>

                  {/* Auto Update Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-black">Auto Update (24h)</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.auto_update}
                        onChange={(e) => setSettings({...settings, auto_update: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <button
                    onClick={saveSettings}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Save Filter Settings
                  </button>
                </div>
              </div>

              {/* Section 3: Commission Tiers System */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-black">Commission Tiers System</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Connected to kinguin_commission_tiers</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {commissionTiers.map(tier => (
                    <div key={tier.id} className="grid grid-cols-5 gap-2 items-center">
                      <input
                        type="number"
                        value={tier.min_price}
                        onChange={(e) => updateCommissionTier(tier.id, 'min_price', parseFloat(e.target.value) || 0)}
                        className="p-2 border border-gray-300 rounded text-sm text-black"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={tier.max_price}
                        onChange={(e) => updateCommissionTier(tier.id, 'max_price', parseFloat(e.target.value) || 0)}
                        className="p-2 border border-gray-300 rounded text-sm text-black"
                        step="0.01"
                      />
                      <select
                        value={tier.type}
                        onChange={(e) => updateCommissionTier(tier.id, 'type', e.target.value)}
                        className="p-2 border border-gray-300 rounded text-sm text-black"
                      >
                        <option value="Fixed">Fixed</option>
                        <option value="Percent">Percent</option>
                      </select>
                      <input
                        type="number"
                        value={tier.rate}
                        onChange={(e) => updateCommissionTier(tier.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="p-2 border border-gray-300 rounded text-sm text-black"
                        step="0.01"
                      />
                      <button
                        onClick={() => removeCommissionTier(tier.id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addCommissionTier}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    + Add Tier
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Save button clicked!');
                      saveCommissionTiers();
                    }}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Save Commission Tiers
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Section 4: Import Controls */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-black">Import Controls</h2>
                
                {/* Status Display */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-black">
                  <div className="flex justify-between">
                    <span>Page {importStatus.current_page || 0}</span>
                    <span>{importStatus.imported || 0} Imported</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{importStatus.skipped || 0} Skipped</span>
                    <span>{importStatus.errors || 0} Errors</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{
                      width: importStatus.total_products > 0 
                        ? `${Math.min(100, (importStatus.imported / importStatus.total_products) * 100)}%`
                        : '0%'
                    }}
                  ></div>
                </div>

                {/* Status Indicator */}
                <div className="mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    importStatus.status === 'Running' ? 'bg-green-100 text-green-800' :
                    importStatus.status === 'Stopped' ? 'bg-red-100 text-red-800' :
                    importStatus.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    importStatus.status === 'Error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {importStatus.status === 'Running' && <span className="animate-pulse mr-1">●</span>}
                    Status: {importStatus.status || 'Idle'}
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleImportAction('resume')}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      ▶ Resume Import
                    </button>
                    <button
                      onClick={() => handleImportAction('stop')}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    >
                      ⏸ Stop
                    </button>
                  </div>
                  <button
                    onClick={() => handleImportAction('start')}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Start Import
                  </button>
                  <button
                    onClick={() => handleImportAction('update')}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Update Existing Products
                  </button>
                  <button
                    onClick={() => handleImportAction('clear-products')}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Clear All Products
                  </button>
                  <button
                    onClick={() => handleImportAction('bulk-price-update')}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    💰 Bulk Price Update
                  </button>
                </div>
              </div>

              {/* Section 5: Import Logs */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-black">Import Logs</h2>
                  <button
                    onClick={() => handleImportAction('clear-logs')}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Clear Logs
                  </button>
                </div>
                
                <div className="bg-black text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">No logs available. Start an import to see activity.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}