import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faEdit, faEye, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

export default function ContactFormSettings() {
  const [settings, setSettings] = useState({
    form_settings: {
      title: 'Contact Us',
      subtitle: 'Have a question or need assistance? We\'re here to help! Get in touch with our support team and we\'ll get back to you as soon as possible.',
      show_file_upload: true,
      max_file_size: '5MB',
      allowed_file_types: 'jpg,png,pdf,txt',
      success_message: 'Thank you for your message! We\'ll get back to you soon.',
      required_fields: ['name', 'email', 'subject', 'message']
    },
    contact_info: {
      title: 'Contact Information',
      email: 'hello@gameva.com',
      phone: '(555) 123-4567',
      address: '123 Gaming Street, Digital City, DC 12345',
      business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
      support_hours: '24/7 Online Support Available',
      show_social_links: true,
      social_links: [
        { platform: 'Discord', url: 'https://discord.gg/gameva', icon: 'fab fa-discord' },
        { platform: 'Twitter', url: 'https://twitter.com/gameva', icon: 'fab fa-twitter' },
        { platform: 'Facebook', url: 'https://facebook.com/gameva', icon: 'fab fa-facebook' }
      ]
    },
    form_fields: [
      { id: 1, name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name', order: 1 },
      { id: 2, name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'Enter your email', order: 2 },
      { id: 3, name: 'subject', label: 'Subject', type: 'select', required: true, options: ['General Inquiry', 'Order Support', 'Technical Issue', 'Billing Question', 'Refund Request', 'Partnership'], order: 3 },
      { id: 4, name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Describe your question or issue...', order: 4 },
      { id: 5, name: 'file', label: 'Attachment', type: 'file', required: false, placeholder: 'Upload screenshot or document', order: 5 }
    ],
    cta_section: {
      title: 'Need Immediate Assistance?',
      subtitle: 'For urgent matters or immediate support, don\'t hesitate to reach out through our priority channels.',
      email_button: {
        label: 'Email Us Now',
        link: 'mailto:hello@gameva.com',
        show: true
      },
      phone_button: {
        label: 'Call Us: (555) 123-4567',
        link: 'tel:+15551234567',
        show: true
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/contact-form-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading contact form settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/contact-form-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Contact form settings saved successfully!');
      } else {
        console.error('API Error:', result);
        alert(`Error saving settings: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFormSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      form_settings: {
        ...prev.form_settings,
        [field]: value
      }
    }));
  };

  const updateContactInfo = (field, value) => {
    setSettings(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const updateFormField = (fieldId, updates) => {
    setSettings(prev => ({
      ...prev,
      form_fields: prev.form_fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const addFormField = () => {
    const newField = {
      id: Date.now(),
      name: 'new_field',
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: 'Enter placeholder...',
      order: settings.form_fields.length + 1
    };
    setSettings(prev => ({
      ...prev,
      form_fields: [...prev.form_fields, newField]
    }));
  };

  const removeFormField = (fieldId) => {
    setSettings(prev => ({
      ...prev,
      form_fields: prev.form_fields.filter(field => field.id !== fieldId)
    }));
  };

  const addSocialLink = () => {
    const newLink = {
      platform: 'Custom',
      url: 'https://',
      icon: 'fab fa-link'
    };
    setSettings(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        social_links: [...prev.contact_info.social_links, newLink]
      }
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        social_links: prev.contact_info.social_links.map((link, i) =>
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  const removeSocialLink = (index) => {
    setSettings(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        social_links: prev.contact_info.social_links.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Contact Form Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Configure your contact form, contact information, and call-to-action sections
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FontAwesomeIcon icon={faEdit} className="mr-3 text-blue-600" />
                Contact Form Configuration
              </h2>

              <div className="space-y-6">
                {/* Form Header Settings */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Form Header</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Form Title
                      </label>
                      <input
                        type="text"
                        value={settings.form_settings.title}
                        onChange={(e) => updateFormSettings('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Form Subtitle
                      </label>
                      <textarea
                        value={settings.form_settings.subtitle}
                        onChange={(e) => updateFormSettings('subtitle', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Form Fields</h3>
                    <button
                      onClick={addFormField}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Add Field
                    </button>
                  </div>
                  <div className="space-y-3">
                    {settings.form_fields.map((field) => (
                      <div key={field.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                            placeholder="Field Label"
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateFormField(field.id, { type: e.target.value })}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                            <option value="file">File Upload</option>
                          </select>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                              className="mr-2"
                            />
                            Required
                          </label>
                          <button
                            onClick={() => removeFormField(field.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Upload Settings */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">File Upload Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={settings.form_settings.show_file_upload}
                        onChange={(e) => updateFormSettings('show_file_upload', e.target.checked)}
                        className="mr-2"
                      />
                      Enable File Upload
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max File Size</label>
                        <input
                          type="text"
                          value={settings.form_settings.max_file_size}
                          onChange={(e) => updateFormSettings('max_file_size', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Allowed Types</label>
                        <input
                          type="text"
                          value={settings.form_settings.allowed_file_types}
                          onChange={(e) => updateFormSettings('allowed_file_types', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <FontAwesomeIcon icon={faEdit} className="mr-3 text-green-600" />
                Contact Information
              </h2>

              <div className="space-y-6">
                {/* Contact Details */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Section Title
                      </label>
                      <input
                        type="text"
                        value={settings.contact_info.title}
                        onChange={(e) => updateContactInfo('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.contact_info.email}
                        onChange={(e) => updateContactInfo('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.contact_info.phone}
                        onChange={(e) => updateContactInfo('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Address
                      </label>
                      <textarea
                        value={settings.contact_info.address}
                        onChange={(e) => updateContactInfo('address', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Business Hours
                      </label>
                      <input
                        type="text"
                        value={settings.contact_info.business_hours}
                        onChange={(e) => updateContactInfo('business_hours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Support Hours
                      </label>
                      <input
                        type="text"
                        value={settings.contact_info.support_hours}
                        onChange={(e) => updateContactInfo('support_hours', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Social Links</h3>
                    <button
                      onClick={addSocialLink}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-1" />
                      Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {settings.contact_info.social_links.map((link, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                            placeholder="Platform"
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                            placeholder="URL"
                            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={link.icon}
                              onChange={(e) => updateSocialLink(index, 'icon', e.target.value)}
                              placeholder="Icon class"
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            />
                            <button
                              onClick={() => removeSocialLink(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="bg-gradient-to-br from-[#153e8f] to-[#0a1b3d] rounded-xl p-8">
            <div className="w-full max-w-[1400px] mx-auto">
              {/* Preview Header */}
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {settings.form_settings.title}
                </h1>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  {settings.form_settings.subtitle}
                </p>
              </div>

              {/* Preview Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form Preview */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6">Contact Us</h2>
                  <div className="space-y-4">
                    {settings.form_fields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-white/90 font-medium mb-2">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full px-4 py-3 bg-white/5 border border-white/30 rounded-lg text-white placeholder-white/50"
                            disabled
                          />
                        ) : field.type === 'select' ? (
                          <select className="w-full px-4 py-3 bg-white/5 border border-white/30 rounded-lg text-white" disabled>
                            <option>Select an option...</option>
                            {field.options?.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 bg-white/5 border border-white/30 rounded-lg text-white placeholder-white/50"
                            disabled
                          />
                        )}
                      </div>
                    ))}
                    <button className="w-full bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white py-3 rounded-lg font-semibold">
                      Send Message
                    </button>
                  </div>
                </div>

                {/* Contact Info Preview */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6">{settings.contact_info.title}</h2>
                  <div className="space-y-6 text-white/90">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Email</h3>
                      <p>{settings.contact_info.email}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Phone</h3>
                      <p>{settings.contact_info.phone}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Address</h3>
                      <p>{settings.contact_info.address}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Business Hours</h3>
                      <p>{settings.contact_info.business_hours}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Support</h3>
                      <p>{settings.contact_info.support_hours}</p>
                    </div>
                    {settings.contact_info.show_social_links && (
                      <div>
                        <h3 className="font-semibold text-white mb-3">Follow Us</h3>
                        <div className="flex gap-3">
                          {settings.contact_info.social_links.map((link, index) => (
                            <a key={index} href={link.url} className="bg-white/20 p-3 rounded-lg hover:bg-white/30 transition-colors">
                              <i className={link.icon + " text-white"}></i>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}