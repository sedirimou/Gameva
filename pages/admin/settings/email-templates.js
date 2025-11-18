import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import AdminLayout from '../../../components/layout/AdminLayout';
import { showAdminNotification } from '../../../components/admin/AdminNotification';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [templatesByCategory, setTemplatesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editFormData, setEditFormData] = useState({
    template_name: '',
    description: '',
    subject: '',
    content: '',
    is_enabled: true,
    is_html: true
  });

  const [newTemplateData, setNewTemplateData] = useState({
    template_key: '',
    template_name: '',
    description: '',
    category: 'Account',
    subject: '',
    content: '',
    is_enabled: true,
    is_html: true
  });

  const [testEmail, setTestEmail] = useState('admin@test.com');
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Available dynamic tags for email templates
  const availableTags = [
    '[USER_NAME]', '[USER_EMAIL]', '[USERNAME]', '[CUSTOMER_NAME]', '[CUSTOMER_EMAIL]', '[CUSTOMER_PHONE]',
    '[ORDER_ID]', '[ORDER_DATE]', '[TOTAL_AMOUNT]', '[CURRENCY]', '[ORDER_ITEMS]', '[PAYMENT_METHOD]',
    '[TRANSACTION_ID]', '[PAYMENT_AMOUNT]', '[PRODUCT_NAME]', '[BUYER_ID]', '[BUYER_MAIL]', '[QUANTITY]',
    '[PRICE]', '[CODE]', '[CODE_IMAGE]', '[TITLE]', '[PAYPAL_MAIL]', '[VERIFICATION_LINK]', '[RESET_LINK]',
    '[CHECKOUT_LINK]', '[DOWNLOAD_LINKS]', '[LICENSE_CODES]', '[DIGITAL_PRODUCTS]', '[CONTACT_NAME]',
    '[CONTACT_EMAIL]', '[CONTACT_SUBJECT]', '[CONTACT_MESSAGE]', '[ADMIN_REPLY_MESSAGE]', '[CANCELLATION_DATE]',
    '[CANCELLATION_REASON]', '[REFUND_AMOUNT]', '[ESTIMATED_DELIVERY]', '[DELIVERY_DATE]', '[RETURN_REASON]',
    '[RETURN_AMOUNT]', '[INVOICE_ID]', '[INVOICE_AMOUNT]', '[DUE_DATE]', '[PAYMENT_LINK]', '[REVIEW_LINK]',
    '[DELETION_DATE]', '[RETURN_STATUS]', '[STATUS_MESSAGE]', '[UPLOAD_DATE]', '[FILE_TYPE]', '[ADMIN_LINK]',
    '[UPDATE_DATE]', '[UPDATE_NOTES]', '[DOWNLOAD_LINK]', '[CART_ITEMS]'
  ];

  // Initialize CKEditor 4
  useEffect(() => {
    const loadCKEditor = () => {
      if (typeof window !== 'undefined' && window.CKEDITOR) {
        setEditorLoaded(true);
        
        // Global configuration
        window.CKEDITOR.config.notification_warning = false;
        window.CKEDITOR.config.versionCheck = false;
        
        // Enhanced configuration for email templates
        window.CKEDITOR.editorConfig = function(config) {
          config.height = 400;
          config.toolbar = [
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'] },
            { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
            { name: 'links', items: ['Link', 'Unlink'] },
            '/',
            { name: 'insert', items: ['Table', 'HorizontalRule', 'SpecialChar'] },
            { name: 'styles', items: ['Format', 'FontSize'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            { name: 'tools', items: ['Maximize', 'Source'] }
          ];
          config.allowedContent = true;
          // Enable justify plugin explicitly for standard CDN build
          config.extraPlugins = 'justify';
          config.notification_warning = false;
          config.versionCheck = false;
        };
      } else {
        // Retry loading after a short delay
        setTimeout(loadCKEditor, 500);
      }
    };

    loadCKEditor();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email-templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
        setTemplatesByCategory(data.templatesByCategory);
      } else {
        showAdminNotification('error', 'Error', 'Failed to fetch email templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      showAdminNotification('error', 'Error', 'Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplate = async (templateId, currentStatus) => {
    try {
      const response = await fetch('/api/admin/toggle-email-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: templateId,
          is_enabled: !currentStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the templates state
        setTemplates(prevTemplates =>
          prevTemplates.map(template =>
            template.id === templateId
              ? { ...template, is_enabled: !currentStatus }
              : template
          )
        );

        // Update the templates by category state
        setTemplatesByCategory(prevByCategory => {
          const newByCategory = { ...prevByCategory };
          Object.keys(newByCategory).forEach(category => {
            newByCategory[category] = newByCategory[category].map(template =>
              template.id === templateId
                ? { ...template, is_enabled: !currentStatus }
                : template
            );
          });
          return newByCategory;
        });

        showAdminNotification('success', 'Success', data.message);
      } else {
        showAdminNotification('error', 'Error', data.message);
      }
    } catch (error) {
      console.error('Error toggling template:', error);
      showAdminNotification('error', 'Error', 'Failed to update template status');
    }
  };

  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setEditFormData({
      template_name: template.template_name,
      description: template.description,
      subject: template.subject,
      content: template.content,
      is_enabled: template.is_enabled,
      is_html: template.is_html
    });
    setIsEditing(true);
    
    // Initialize CKEditor for the content field after modal opens
    setTimeout(() => {
      if (window.CKEDITOR && document.getElementById('email-content-editor')) {
        // Destroy existing instance if any
        if (window.CKEDITOR.instances['email-content-editor']) {
          window.CKEDITOR.instances['email-content-editor'].destroy(true);
        }
        
        // Create new editor instance
        const editor = window.CKEDITOR.replace('email-content-editor');
        editor.on('instanceReady', function() {
          this.setData(template.content || '');
        });
        
        editor.on('change', function() {
          const data = this.getData();
          setEditFormData(prev => ({ ...prev, content: data }));
        });
      }
    }, 300);
  };

  const closeEditModal = () => {
    // Clean up CKEditor instance
    if (window.CKEDITOR && window.CKEDITOR.instances['email-content-editor']) {
      window.CKEDITOR.instances['email-content-editor'].destroy(true);
    }
    
    setSelectedTemplate(null);
    setIsEditing(false);
    setEditFormData({
      template_name: '',
      description: '',
      subject: '',
      content: '',
      is_enabled: true,
      is_html: true
    });
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const insertTag = (tag) => {
    setEditFormData(prev => ({
      ...prev,
      content: prev.content + ' ' + tag
    }));
  };

  const saveTemplate = async () => {
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTemplate.id,
          ...editFormData
        })
      });

      const data = await response.json();

      if (data.success) {
        showAdminNotification('success', 'Success', 'Template updated successfully');
        closeEditModal();
        fetchTemplates(); // Refresh the templates list
      } else {
        showAdminNotification('error', 'Error', data.message);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showAdminNotification('error', 'Error', 'Failed to save template');
    }
  };

  const handleNewTemplateChange = (field, value) => {
    setNewTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createNewTemplate = async () => {
    try {
      // Generate template_key from template_name if not provided
      const templateKey = newTemplateData.template_key || 
        newTemplateData.template_name.toLowerCase().replace(/[^a-z0-9]/g, '_');

      const templateData = {
        ...newTemplateData,
        template_key: templateKey
      };

      const response = await fetch('/api/admin/create-email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      const data = await response.json();

      if (data.success) {
        showAdminNotification('success', 'Success', 'Template created successfully');
        fetchTemplates(); // Refresh the list
        setIsAdding(false);
        setNewTemplateData({
          template_key: '',
          template_name: '',
          description: '',
          category: 'Account',
          subject: '',
          content: '',
          is_enabled: true,
          is_html: true
        });
      } else {
        showAdminNotification('error', 'Error', data.message);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showAdminNotification('error', 'Error', 'Failed to create template');
    }
  };

  const closeAddModal = () => {
    setIsAdding(false);
    setNewTemplateData({
      template_key: '',
      template_name: '',
      description: '',
      category: 'Account',
      subject: '',
      content: '',
      is_enabled: true,
      is_html: true
    });
  };

  const sendTestEmail = async (templateId) => {
    if (!testEmail.trim()) {
      showAdminNotification('error', 'Error', 'Please enter a test email address');
      return;
    }

    try {
      const response = await fetch('/api/admin/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateId: templateId || selectedTemplate.id,
          testEmail: testEmail.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        showAdminNotification('success', 'Success', `Test email sent successfully to ${testEmail}`);
      } else {
        showAdminNotification('error', 'Error', data.message);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      showAdminNotification('error', 'Error', 'Failed to send test email');
    }
  };

  const previewTemplate = async (templateKey) => {
    try {
      const response = await fetch('/api/admin/test-email-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preview',
          templateKey: templateKey || selectedTemplate.template_key,
          sampleData: {
            userName: 'John Doe',
            userEmail: 'john@example.com',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            orderId: 'ORD-12345',
            totalAmount: '29.99',
            currency: 'EUR',
            productName: 'Sample Game',
            orderItems: '1x Sample Game - €29.99'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data.preview);
        setShowPreview(true);
      } else {
        showAdminNotification('error', 'Error', data.message || 'Failed to generate preview');
      }
    } catch (error) {
      console.error('Error previewing template:', error);
      showAdminNotification('error', 'Error', 'Failed to generate preview');
    }
  };



  if (loading) {
    return (
      <AdminLayout>
        <Script src="/ckeditor/ckeditor.js" strategy="beforeInteractive" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading templates...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Script src="https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js" strategy="beforeInteractive" />
      <style jsx global>{`
        /* CKEditor Source View Styling */
        .cke_source {
          color: #000000 !important;
          background-color: #ffffff !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
        }
        
        /* Dark mode support for source view */
        .dark .cke_source {
          color: #ffffff !important;
          background-color: #1e293b !important;
        }
        
        /* Hide CKEditor notifications */
        .cke_notifications_area,
        .cke_notification,
        .cke_notification_warning,
        .cke_notification_info,
        .cke_notification_success {
          display: none !important;
        }
        
        /* Improve CKEditor dialog sizing */
        .cke_dialog {
          min-width: 600px !important;
        }
        
        /* Better textarea styling for CKEditor */
        .cke_contents {
          background-color: #ffffff !important;
        }
        
        .dark .cke_contents {
          background-color: #1e293b !important;
        }
      `}</style>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage email notification templates and settings</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Template</span>
          </button>
        </div>

        {/* Templates by Category */}
        {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{category}</h2>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Operations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {categoryTemplates.map((template) => (
                      <tr key={template.id} className={template.is_enabled ? '' : 'opacity-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {template.template_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {template.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {/* Toggle Switch */}
                            <button
                              onClick={() => toggleTemplate(template.id, template.is_enabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                template.is_enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                template.is_enabled ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(template)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {/* Edit Modal */}
        {isEditing && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Edit Template: {selectedTemplate.template_name}
                  </h3>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form Fields */}
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={editFormData.template_name}
                        onChange={(e) => handleInputChange('template_name', e.target.value)}
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows="2"
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={editFormData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Email Content
                      </label>
                      <div className="border border-gray-300 dark:border-slate-600 rounded-lg">
                        <textarea
                          id="email-content-editor"
                          name="email-content-editor"
                          value={editFormData.content}
                          onChange={(e) => handleInputChange('content', e.target.value)}
                          className="w-full h-[500px] p-4 border-0 bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none focus:outline-none"
                          placeholder="Email content..."
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editFormData.is_enabled}
                          onChange={(e) => handleInputChange('is_enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">Enabled</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editFormData.is_html}
                          onChange={(e) => handleInputChange('is_html', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700 dark:text-gray-300">HTML Format</span>
                      </label>
                    </div>
                  </div>

                  {/* Available Tags */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Available Tags</h4>
                    <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-2">
                        {availableTags.map((tag, index) => (
                          <button
                            key={index}
                            onClick={() => insertTag(tag)}
                            className="text-left px-3 py-2 text-xs bg-white dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-slate-500 border border-gray-200 dark:border-slate-500 rounded text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Email Section */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Test Email Address
                      </label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter email to receive test message"
                      />
                    </div>
                    <div className="pt-7">
                      <button
                        onClick={() => sendTestEmail(selectedTemplate.id)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Send Test Message</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={closeEditModal}
                      className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTemplate}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Template Modal */}
        {isAdding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add New Email Template
                  </h3>
                  <button
                    onClick={closeAddModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={newTemplateData.template_name}
                        onChange={(e) => handleNewTemplateChange('template_name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Template Key
                      </label>
                      <input
                        type="text"
                        value={newTemplateData.template_key}
                        onChange={(e) => handleNewTemplateChange('template_key', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Auto-generated from name"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Leave empty to auto-generate from template name
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Category
                      </label>
                      <select
                        value={newTemplateData.category}
                        onChange={(e) => handleNewTemplateChange('category', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Account">Account</option>
                        <option value="Admin">Admin</option>
                        <option value="Contact">Contact</option>
                        <option value="Ecommerce">Ecommerce</option>
                        <option value="Orders">Orders</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={newTemplateData.description}
                        onChange={(e) => handleNewTemplateChange('description', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Brief description of when this template is used"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={newTemplateData.subject}
                        onChange={(e) => handleNewTemplateChange('subject', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email subject line"
                      />
                    </div>
                  </div>

                  {/* Right Column - Available Tags */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Available Tags</h4>
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {availableTags.map((tag, index) => (
                          <button
                            key={index}
                            onClick={() => handleNewTemplateChange('content', newTemplateData.content + ' ' + tag)}
                            className="text-left px-3 py-2 text-xs bg-white dark:bg-slate-600 hover:bg-blue-50 dark:hover:bg-slate-500 border border-gray-200 dark:border-slate-500 rounded text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="mt-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Email Content (HTML)
                  </label>
                  <textarea
                    value={newTemplateData.content}
                    onChange={(e) => handleNewTemplateChange('content', e.target.value)}
                    className="w-full h-64 p-4 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter your HTML email template here..."
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    You can use HTML and the available tags above. Example: Hello [USER_NAME], welcome to our platform!
                  </p>
                </div>

                <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
                  <button
                    onClick={closeAddModal}
                    className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNewTemplate}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}