import { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadset,
  faQuestionCircle,
  faEnvelope,
  faSearch,
  faChevronDown,
  faChevronUp,
  faPaperPlane,
  faPhone,
  faClock,
  faExclamationCircle,
  faCheckCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, faqsRes, settingsRes] = await Promise.all([
        fetch('/api/help-center/categories'),
        fetch('/api/help-center/faqs'),
        fetch('/api/admin/help-center/settings')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
        
        // Auto-select "General Questions" category by default
        const generalCategory = categoriesData.find(cat => 
          cat.name.toLowerCase().includes('general') && cat.name.toLowerCase().includes('questions')
        );
        if (generalCategory) {
          setSelectedCategory(generalCategory.id);
        }
      }
      if (faqsRes.ok) setFaqs(await faqsRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (error) {
      console.error('Error loading help center data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || faq.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory && faq.is_active;
  });

  if (loading) {
    return (
      <MainLayout backgroundColor="#00347d">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading Help Center...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout backgroundColor="#00347d">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 mt-16">
            <h1 className="text-4xl font-bold text-white mb-4">
              <FontAwesomeIcon icon={faHeadset} className="mr-3" />
              Help Center
            </h1>
            <p className="text-xl text-white/80">
              {settings.help_center_subtitle || 'Find answers to common questions and get support'}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-8">
            <a
              href="/page/contact-us"
              className="px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-white hover:text-white bg-white/10 hover:bg-white/20 border border-white/30"
            >
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              Need More Help? Contact Support
            </a>
          </div>

          {/* FAQ Content */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white/10 rounded-lg p-6 border border-white/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="" className="bg-[#00347d] text-white">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-[#00347d] text-white">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'border-white/50 shadow-lg'
                      : 'border-white/30 hover:border-white/40'
                  }`}
                  style={{
                    background: selectedCategory === category.id 
                      ? 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
                      : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="text-center">
                    {category.icon && (
                      <FontAwesomeIcon 
                        icon={faQuestionCircle} 
                        className="text-2xl text-white mb-2" 
                      />
                    )}
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-white/80 mt-1">{category.description}</p>
                    <span className="text-xs text-white/60 mt-2 block">
                      {faqs.filter(faq => faq.category_id === category.id && faq.is_active).length} FAQs
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 bg-white/10 rounded-lg border border-white/30">
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl text-white/50 mb-4" />
                  <p className="text-white/70">No FAQs found matching your search criteria.</p>
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div key={faq.id} className="bg-white/10 rounded-lg border border-white/30">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{faq.question}</h3>
                      </div>
                      <FontAwesomeIcon 
                        icon={expandedFaq === faq.id ? faChevronUp : faChevronDown} 
                        className="text-white/50 ml-4" 
                      />
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-white/20 pt-4">
                          <p className="text-white/90 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}