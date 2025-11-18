import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * Official Contact Form Component
 * 
 * This is the official contact form used across the entire project.
 * Design Standards:
 * - Background: #00347d (dark blue)
 * - Fields: bg-white/10 with border-white/30
 * - Button: Green gradient linear-gradient(131deg, #99b476 0%, #29adb2 100%)
 * - Text: White (#ffffff) with white/70 placeholders
 * - Responsive design with proper spacing and fonts
 */
const ContactForm = ({ 
  config = {}, 
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    orderNumber: '',
    subject: '',
    description: '',
    files: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const fileInputRef = useRef(null);

  // Official design configuration
  const {
    title = 'Contact Us',
    subtitle = 'Get in touch with our support team',
    instructionalText = 'Please fill out the form below and we\'ll get back to you as soon as possible.',
    buttonText = 'Send Message',
    showOrderNumber = true,
    backgroundColor = '#00347d',
    textColor = 'text-white',
    buttonColor = 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)'
  } = config;

  const onDrop = (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setSubmitMessage('Some files were rejected. Please ensure files are PNG, JPG, GIF, or WebP and under 2MB.');
      return;
    }

    // Add accepted files to the form
    const newFiles = acceptedFiles.filter(file => {
      // Check if file already exists
      return !formData.files.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles]
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.subject || !formData.description) {
      setSubmitMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const submitData = new FormData();
      submitData.append('email', formData.email);
      submitData.append('orderNumber', formData.orderNumber);
      submitData.append('subject', formData.subject);
      submitData.append('description', formData.description);
      
      // Add files to FormData
      formData.files.forEach((file, index) => {
        submitData.append(`files`, file);
      });

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        setSubmitMessage('Thank you for your message! We\'ll get back to you soon.');
        setFormData({
          email: '',
          orderNumber: '',
          subject: '',
          description: '',
          files: []
        });
      } else {
        setSubmitMessage('There was an error sending your message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitMessage('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="shadow-lg rounded-lg p-6 sm:p-8 max-w-2xl mx-auto"
      style={{ backgroundColor: backgroundColor }}
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className={`block text-sm font-medium ${textColor} mb-2`}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/70 transition-all duration-200"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Order Number Field (optional) */}
        {showOrderNumber && (
          <div>
            <label htmlFor="orderNumber" className={`block text-sm font-medium ${textColor} mb-2`}>
              Order Number (Optional)
            </label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/70 transition-all duration-200"
              placeholder="Your order number"
            />
          </div>
        )}

        {/* Subject Field */}
        <div>
          <label htmlFor="subject" className={`block text-sm font-medium ${textColor} mb-2`}>
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/70 transition-all duration-200"
            placeholder="What is your message about?"
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className={`block text-sm font-medium ${textColor} mb-2`}>
            Message *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={5}
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/70 transition-all duration-200 resize-vertical"
            placeholder="Please describe your issue or question in detail..."
          />
        </div>

        {/* File Upload Section */}
        <div>
          <label className={`block text-sm font-medium ${textColor} mb-2`}>
            Attachments (Optional)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-white/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-white/70">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {isDragActive ? (
                <p>Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-sm">Drag & drop files here, or click to select</p>
                  <p className="text-xs text-white/50 mt-1">PNG, JPG, GIF, WebP up to 2MB each</p>
                </div>
              )}
            </div>
          </div>

          {/* File List */}
          {formData.files.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white/10 p-2 rounded-md">
                  <span className="text-sm text-white/80 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300 ml-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Message */}
        {submitMessage && (
          <div className={`text-sm p-3 rounded-md ${
            submitMessage.includes('Thank you') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {submitMessage}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{ 
            background: buttonColor,
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Sending...' : buttonText}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;