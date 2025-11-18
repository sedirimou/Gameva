/**
 * Search Management Admin Panel
 * Manage Typesense search index and statistics
 */

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { CheckCircle, XCircle, RotateCcw, Trash2, BarChart3, Database, Search, Clock } from 'lucide-react';

export default function SearchManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/typesense?action=stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        showMessage(data.error || 'Failed to fetch stats', 'error');
      }
    } catch (error) {
      showMessage('Error fetching search statistics', 'error');
      console.error('Stats fetch error:', error);
    }
  };

  const handleReindex = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/typesense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reindex' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage(data.message, 'success');
        await fetchStats();
      } else {
        showMessage(data.error || 'Failed to reindex', 'error');
      }
    } catch (error) {
      showMessage('Error during reindexing', 'error');
      console.error('Reindex error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear the search index? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/typesense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage(data.message, 'success');
        await fetchStats();
      } else {
        showMessage(data.error || 'Failed to clear index', 'error');
      }
    } catch (error) {
      showMessage('Error clearing search index', 'error');
      console.error('Clear error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Search Management</h1>
          <p className="text-white/70">
            Manage Typesense search index and monitor search performance
          </p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            messageType === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {messageType === 'success' && <CheckCircle className="w-5 h-5" />}
              {messageType === 'error' && <XCircle className="w-5 h-5" />}
              {messageType === 'info' && <BarChart3 className="w-5 h-5" />}
              {message}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Total Documents</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {stats?.totalDocuments?.toLocaleString() || '0'}
            </p>
            <p className="text-white/60 text-sm mt-1">Products indexed</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Search className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Collection Status</h3>
            </div>
            <p className="text-xl font-bold text-green-400">
              {stats ? 'Active' : 'Unknown'}
            </p>
            <p className="text-white/60 text-sm mt-1">Search engine status</p>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Last Updated</h3>
            </div>
            <p className="text-sm font-medium text-purple-400">
              {stats?.created ? new Date(stats.created).toLocaleString() : 'Unknown'}
            </p>
            <p className="text-white/60 text-sm mt-1">Collection created</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Search Index Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleReindex}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Reindexing...' : 'Reindex All Products'}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Clear Search Index
            </button>
          </div>

          <div className="mt-6 text-sm text-white/60">
            <h3 className="font-medium text-white mb-2">About Search Management:</h3>
            <ul className="space-y-1">
              <li>• <strong>Reindex All Products:</strong> Rebuilds the entire search index with current product data</li>
              <li>• <strong>Clear Search Index:</strong> Removes all documents from the search index</li>
              <li>• Search indices are automatically updated when products are created, updated, or deleted</li>
              <li>• Use reindex if search results seem outdated or incomplete</li>
            </ul>
          </div>
        </div>

        {/* Search Test Section */}
        <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Test Search</h2>
          <SearchTest />
        </div>
      </div>
    </AdminLayout>
  );
}

// Search Test Component
function SearchTest() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(`/api/search/typesense?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (response.ok) {
        setResults(data);
      } else {
        console.error('Search error:', data.error);
      }
    } catch (error) {
      console.error('Search test error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter search query (e.g., 'Cyberpunk', 'Steam', 'Action')"
          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {searching ? 'Searching...' : 'Test Search'}
        </button>
      </div>

      {results && (
        <div className="mt-4">
          <p className="text-white/70 text-sm mb-2">
            Found {results.totalHits} results in {results.processingTimeMs || 0}ms
          </p>
          
          {results.hits.length > 0 ? (
            <div className="space-y-2">
              {results.hits.slice(0, 5).map((product) => (
                <div key={product.id} className="bg-white/5 p-3 rounded border border-white/10">
                  <div className="flex items-center gap-3">
                    {product.images_cover_thumbnail && (
                      <img 
                        src={product.images_cover_thumbnail} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h4 className="text-white font-medium">{product.name}</h4>
                      <p className="text-white/60 text-sm">
                        {product.platform} • €{product.final_price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-sm">No results found</p>
          )}
        </div>
      )}
    </div>
  );
}