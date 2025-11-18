/**
 * CookiePolicySection Component - Cookie policy information
 */
const CookiePolicySection = ({ data }) => {
  const {
    title = 'Cookie Policy',
    lastUpdated = new Date().toLocaleDateString(),
    sections = [
      {
        title: 'What are cookies?',
        content: 'Cookies are small text files that are stored on your computer or mobile device when you visit our website.'
      },
      {
        title: 'How we use cookies',
        content: 'We use cookies to improve your browsing experience, analyze site traffic, and personalize content.'
      },
      {
        title: 'Types of cookies we use',
        content: 'Essential cookies, Analytics cookies, Marketing cookies, and Preference cookies.'
      },
      {
        title: 'Managing cookies',
        content: 'You can control and manage cookies through your browser settings or our cookie preferences center.'
      }
    ],
    showTableOfContents = true,
    backgroundColor = 'transparent',
    customClasses = '',
    marginTop = '0',
    marginBottom = '2rem'
  } = data;

  const containerStyle = {
    marginTop,
    marginBottom,
    backgroundColor
  };

  const scrollToSection = (index) => {
    const element = document.getElementById(`cookie-section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`cookie-policy-section ${customClasses}`}
      style={containerStyle}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-600">Last updated: {lastUpdated}</p>
        </div>

        {showTableOfContents && sections.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              {sections.map((section, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(index)}
                    className="text-[#29adb2] hover:text-[#99b476] transition-colors duration-200 text-left"
                  >
                    {index + 1}. {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="prose max-w-none">
          {sections.map((section, index) => (
            <div key={index} id={`cookie-section-${index}`} className="mb-8 scroll-mt-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {section.title}
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Questions about our Cookie Policy?
          </h3>
          <p className="text-blue-800">
            If you have any questions about this Cookie Policy, please contact us through our contact page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicySection;