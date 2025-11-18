/**
 * GDPRSection Component - GDPR compliance information
 */
const GDPRSection = ({ data }) => {
  const {
    title = 'GDPR Compliance',
    subtitle = 'Your Privacy Rights Under GDPR',
    sections = [
      {
        title: 'Your Rights',
        content: 'Under GDPR, you have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data.'
      },
      {
        title: 'Data We Collect',
        content: 'We collect personal data that you provide directly to us, such as when you create an account, make a purchase, or contact us.'
      },
      {
        title: 'How We Use Your Data',
        content: 'We use your personal data to provide our services, process transactions, communicate with you, and improve our platform.'
      },
      {
        title: 'Data Retention',
        content: 'We retain your personal data only for as long as necessary to fulfill the purposes outlined in our privacy policy.'
      },
      {
        title: 'Contact Our DPO',
        content: 'If you have questions about your privacy rights, please contact our Data Protection Officer at privacy@company.com.'
      }
    ],
    showRightsButtons = true,
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

  const userRights = [
    { name: 'Access Your Data', action: 'access', description: 'Request a copy of your personal data' },
    { name: 'Rectify Data', action: 'rectify', description: 'Correct inaccurate personal data' },
    { name: 'Erase Data', action: 'erase', description: 'Request deletion of your personal data' },
    { name: 'Restrict Processing', action: 'restrict', description: 'Limit how we process your data' },
    { name: 'Data Portability', action: 'portability', description: 'Transfer your data to another service' },
    { name: 'Object to Processing', action: 'object', description: 'Object to certain data processing' }
  ];

  const handleRightRequest = (action) => {
    // In a real implementation, this would open a form or redirect to a request page
    alert(`GDPR ${action} request initiated. You will be redirected to the request form.`);
  };

  return (
    <div 
      className={`gdpr-section ${customClasses}`}
      style={containerStyle}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>

        {showRightsButtons && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Exercise Your Rights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRights.map((right, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{right.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{right.description}</p>
                  <button
                    onClick={() => handleRightRequest(right.action)}
                    className="w-full bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow duration-300"
                  >
                    Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prose max-w-none">
          {sections.map((section, index) => (
            <div key={index} className="mb-8">
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
            Questions About GDPR?
          </h3>
          <p className="text-blue-800 mb-4">
            Our Data Protection Officer is available to help with any GDPR-related questions or requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:privacy@company.com"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 text-center"
            >
              Email DPO
            </a>
            <a
              href="/contact"
              className="inline-block border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-300 text-center"
            >
              Contact Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRSection;