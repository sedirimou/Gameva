import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import PaymentsSection from './PaymentsSection';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2025); // Static fallback
  const [footerCategories, setFooterCategories] = useState([]);
  const [footerPages, setFooterPages] = useState({});
  const [openSections, setOpenSections] = useState({
    quickLinks: false,
    customerService: false,
    legal: false,
    contact: false
  });

  // Set current year on client-side to avoid hydration mismatch
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      // Fetch footer categories and pages
      const categoriesResponse = await fetch('/api/admin/page-categories');
      const categoriesData = await categoriesResponse.json();
      
      if (categoriesData.categories) {
        setFooterCategories(categoriesData.categories);
        
        // Fetch pages for each category
        const pagesResponse = await fetch('/api/footer-pages');
        const pagesData = await pagesResponse.json();
        
        if (pagesData.success) {
          setFooterPages(pagesData.pages);
        }
      } else {
        console.log('Failed to load footer categories:', categoriesData);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      // Fallback to hardcoded data if API fails
      setFooterCategories([
        { id: 1, name: 'Quick Links', slug: 'quick-links' },
        { id: 2, name: 'Customer Service', slug: 'customer-service' },
        { id: 3, name: 'Legal', slug: 'legal' },
        { id: 13, name: 'Contact', slug: 'contact' }
      ]);
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  // Helper function to get pages for a category
  const getPagesForCategory = (categoryId) => {
    return footerPages[categoryId] || [];
  };

  // Helper function to get category by slug
  const getCategoryBySlug = (slug) => {
    return footerCategories.find(cat => cat.slug === slug) || null;
  };

  // Helper function to format page href
  const getPageHref = (page) => {
    if (page.slug === 'home-footer') return '/';
    if (page.slug === 'products-footer') return '/category/all-products';
    if (page.slug === 'contact-us') return '/page/contact-us';
    if (page.slug === 'about-us') return '/page/about-us';
    return `/page/${page.slug}`;
  };

  // Dynamic footer sections based on database data
  const getDynamicFooterSections = () => {
    if (!footerCategories.length) {
      return [];
    }
    
    return footerCategories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      pages: getPagesForCategory(category.id)
    }));
  };

  // Initialize open sections based on categories
  useEffect(() => {
    if (footerCategories.length > 0) {
      const initialOpenSections = {};
      footerCategories.forEach(category => {
        initialOpenSections[category.slug] = false;
      });
      setOpenSections(initialOpenSections);
    }
  }, [footerCategories]);

  return (
    <div>
      {/* Payments Section */}
      <PaymentsSection />
      
      <footer className="text-white pt-6 sm:pt-8 md:pt-12 lg:pt-16" style={{ backgroundColor: '#000d6e' }}>
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout - Collapsible Sections */}
          <div className="block md:hidden space-y-2">
            {getDynamicFooterSections().map((section) => (
              <div key={section.id} className="border-b border-slate-700">
                <button
                  onClick={() => toggleSection(section.slug)}
                  className="w-full flex justify-between items-center py-4 text-lg font-semibold hover:text-accent transition-colors"
                >
                  {section.name}
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${openSections[section.slug] ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSections[section.slug] ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                  {section.slug === 'contact' ? (
                    <div className="space-y-3 text-slate-300">
                      <p className="flex items-center py-1">
                        <Mail className="w-4 h-4 mr-2" />
                        hello@gameva.com
                      </p>
                      <p className="flex items-center py-1">
                        <Phone className="w-4 h-4 mr-2" />
                        +1 (555) 123-4567
                      </p>
                      <p className="flex items-center py-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        123 Gaming St, City, State 12345
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {section.pages.map((page) => (
                        <li key={page.id}>
                          <Link 
                            href={getPageHref(page)} 
                            className="text-slate-300 hover:text-white hover:-translate-y-0.5 transition-all duration-200 ease-in-out block py-1"
                          >
                            {page.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Layout - Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
            {getDynamicFooterSections().map((section) => (
              <div key={section.id}>
                <h4 className="text-lg font-semibold mb-4">{section.name}</h4>
                {section.slug === 'contact' ? (
                  <div className="space-y-2 text-slate-300">
                    <p className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      hello@gameva.com
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      +1 (555) 123-4567
                    </p>
                    <p className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      123 Gaming St, City, State 12345
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {section.pages.map((page) => (
                      <li key={page.id}>
                        <Link 
                          href={getPageHref(page)} 
                          className="text-slate-300 hover:text-white transition-colors"
                        >
                          {page.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-12 border-t border-slate-600 w-full">
            <p className="text-slate-300 pt-6 pb-4">
              © {currentYear} Gameva. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}