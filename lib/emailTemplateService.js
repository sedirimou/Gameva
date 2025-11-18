/**
 * Email Template Service with Dynamic Tag Replacement
 * Handles email template management and dynamic content replacement
 */

import { query } from './database.js';
import { createTransporter } from './emailService.js';

/**
 * Get email template by key
 * @param {string} templateKey - Template identifier
 * @returns {Promise<Object>} Template object or null
 */
export async function getEmailTemplate(templateKey) {
  try {
    const result = await query(`
      SELECT * FROM email_templates 
      WHERE template_key = $1 AND is_enabled = true
    `, [templateKey]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching email template:', error);
    throw error;
  }
}

/**
 * Replace dynamic tags in template content
 * @param {string} content - Template content with tags
 * @param {Object} data - Data object for tag replacement
 * @returns {string} Content with replaced tags
 */
export function replaceDynamicTags(content, data = {}) {
  if (!content) return '';
  
  let processedContent = content;
  
  // Define tag mappings and replacements
  const tagMappings = {
    // User Information
    '[USER_NAME]': data.userName || data.user_name || data.firstName || '',
    '[USER_EMAIL]': data.userEmail || data.user_email || data.email || '',
    '[USERNAME]': data.username || '',
    '[CUSTOMER_NAME]': data.customerName || data.customer_name || data.firstName || '',
    '[CUSTOMER_EMAIL]': data.customerEmail || data.customer_email || data.email || '',
    '[CUSTOMER_PHONE]': data.customerPhone || data.customer_phone || data.phone || '',
    
    // Order Information
    '[ORDER_ID]': data.orderId || data.order_id || '',
    '[ORDER_DATE]': data.orderDate || data.order_date || new Date().toLocaleDateString(),
    '[TOTAL_AMOUNT]': data.totalAmount || data.total_amount || data.total || '0.00',
    '[CURRENCY]': data.currency || 'EUR',
    '[ORDER_ITEMS]': data.orderItems || data.order_items || '',
    '[PAYMENT_METHOD]': data.paymentMethod || data.payment_method || '',
    '[TRANSACTION_ID]': data.transactionId || data.transaction_id || '',
    '[PAYMENT_AMOUNT]': data.paymentAmount || data.payment_amount || data.totalAmount || '0.00',
    
    // Product Information
    '[PRODUCT_NAME]': data.productName || data.product_name || '',
    '[BUYER_ID]': data.buyerId || data.buyer_id || data.orderId || '',
    '[BUYER_MAIL]': data.buyerMail || data.buyer_mail || data.customerEmail || '',
    '[QUANTITY]': data.quantity || '1',
    '[PRICE]': data.price || '0.00',
    '[CODE]': data.code || data.gameKey || '',
    '[CODE_IMAGE]': data.codeImage || data.code_image || '',
    '[TITLE]': data.title || data.productName || '',
    '[PAYPAL_MAIL]': data.paypalMail || data.paypal_mail || '',
    
    // Links and Actions
    '[VERIFICATION_LINK]': data.verificationLink || data.verification_link || '',
    '[RESET_LINK]': data.resetLink || data.reset_link || '',
    '[CHECKOUT_LINK]': data.checkoutLink || data.checkout_link || '',
    '[DOWNLOAD_LINKS]': data.downloadLinks || data.download_links || '',
    '[LICENSE_CODES]': data.licenseCodes || data.license_codes || '',
    '[DIGITAL_PRODUCTS]': data.digitalProducts || data.digital_products || '',
    '[PAYMENT_LINK]': data.paymentLink || data.payment_link || '',
    '[REVIEW_LINK]': data.reviewLink || data.review_link || '',
    '[ADMIN_LINK]': data.adminLink || data.admin_link || '',
    '[DOWNLOAD_LINK]': data.downloadLink || data.download_link || '',
    
    // Contact Information
    '[CONTACT_NAME]': data.contactName || data.contact_name || '',
    '[CONTACT_EMAIL]': data.contactEmail || data.contact_email || '',
    '[CONTACT_SUBJECT]': data.contactSubject || data.contact_subject || '',
    '[CONTACT_MESSAGE]': data.contactMessage || data.contact_message || '',
    '[ADMIN_REPLY_MESSAGE]': data.adminReplyMessage || data.admin_reply_message || '',
    
    // Order Status and Management
    '[CANCELLATION_DATE]': data.cancellationDate || data.cancellation_date || new Date().toLocaleDateString(),
    '[CANCELLATION_REASON]': data.cancellationReason || data.cancellation_reason || '',
    '[REFUND_AMOUNT]': data.refundAmount || data.refund_amount || data.totalAmount || '0.00',
    '[ESTIMATED_DELIVERY]': data.estimatedDelivery || data.estimated_delivery || '',
    '[DELIVERY_DATE]': data.deliveryDate || data.delivery_date || new Date().toLocaleDateString(),
    '[RETURN_REASON]': data.returnReason || data.return_reason || '',
    '[RETURN_AMOUNT]': data.returnAmount || data.return_amount || '0.00',
    '[RETURN_STATUS]': data.returnStatus || data.return_status || '',
    '[STATUS_MESSAGE]': data.statusMessage || data.status_message || '',
    
    // Invoice and Payment
    '[INVOICE_ID]': data.invoiceId || data.invoice_id || '',
    '[INVOICE_AMOUNT]': data.invoiceAmount || data.invoice_amount || data.totalAmount || '0.00',
    '[DUE_DATE]': data.dueDate || data.due_date || '',
    
    // Account Management
    '[DELETION_DATE]': data.deletionDate || data.deletion_date || '',
    
    // Admin and File Management
    '[UPLOAD_DATE]': data.uploadDate || data.upload_date || new Date().toLocaleDateString(),
    '[FILE_TYPE]': data.fileType || data.file_type || '',
    '[UPDATE_DATE]': data.updateDate || data.update_date || new Date().toLocaleDateString(),
    '[UPDATE_NOTES]': data.updateNotes || data.update_notes || '',
    
    // Shopping Cart
    '[CART_ITEMS]': data.cartItems || data.cart_items || ''
  };
  
  // Replace all tags in the content
  Object.entries(tagMappings).forEach(([tag, replacement]) => {
    const regex = new RegExp(tag.replace(/[[\]]/g, '\\$&'), 'g');
    processedContent = processedContent.replace(regex, replacement);
  });
  
  return processedContent;
}

/**
 * Send email using template with dynamic data
 * @param {string} templateKey - Template identifier
 * @param {string} recipientEmail - Recipient email address
 * @param {Object} data - Dynamic data for tag replacement
 * @param {Object} customConfig - Optional custom email configuration
 * @returns {Promise<Object>} Email send result
 */
export async function sendTemplatedEmail(templateKey, recipientEmail, data = {}, customConfig = null) {
  try {
    // Get the template
    const template = await getEmailTemplate(templateKey);
    if (!template) {
      throw new Error(`Email template not found: ${templateKey}`);
    }
    
    // Replace dynamic tags in subject and content
    const processedSubject = replaceDynamicTags(template.subject, data);
    const processedContent = replaceDynamicTags(template.content, data);
    
    // Create email transporter
    const transporter = createTransporter(customConfig);
    
    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@gameva.com',
      to: recipientEmail,
      subject: processedSubject,
      html: template.is_html ? processedContent : undefined,
      text: !template.is_html ? processedContent : undefined
    };
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully: ${templateKey} to ${recipientEmail}`, result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      template: templateKey,
      recipient: recipientEmail
    };
    
  } catch (error) {
    console.error('Error sending templated email:', error);
    throw error;
  }
}

/**
 * Send bulk emails using template
 * @param {string} templateKey - Template identifier
 * @param {Array} recipients - Array of recipient objects {email, data}
 * @param {Object} globalData - Global data applied to all emails
 * @param {Object} customConfig - Optional custom email configuration
 * @returns {Promise<Array>} Array of send results
 */
export async function sendBulkTemplatedEmails(templateKey, recipients, globalData = {}, customConfig = null) {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const mergedData = { ...globalData, ...recipient.data };
      const result = await sendTemplatedEmail(templateKey, recipient.email, mergedData, customConfig);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        recipient: recipient.email
      });
    }
  }
  
  return results;
}

/**
 * Preview email template with sample data
 * @param {string} templateKey - Template identifier
 * @param {Object} sampleData - Sample data for preview
 * @returns {Promise<Object>} Preview data
 */
export async function previewEmailTemplate(templateKey, sampleData = {}) {
  try {
    const template = await getEmailTemplate(templateKey);
    if (!template) {
      throw new Error(`Email template not found: ${templateKey}`);
    }
    
    // Use sample data if provided, otherwise use defaults
    const defaultSampleData = {
      userName: 'John Doe',
      userEmail: 'john@example.com',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      orderId: 'ORD-12345',
      totalAmount: '29.99',
      currency: 'EUR',
      productName: 'Sample Game',
      orderItems: '1x Sample Game - €29.99'
    };
    
    const previewData = { ...defaultSampleData, ...sampleData };
    
    return {
      template: template,
      subject: replaceDynamicTags(template.subject, previewData),
      content: replaceDynamicTags(template.content, previewData),
      sampleData: previewData
    };
  } catch (error) {
    console.error('Error previewing email template:', error);
    throw error;
  }
}

/**
 * Validate template tags
 * @param {string} content - Template content
 * @returns {Object} Validation result
 */
export function validateTemplateTags(content) {
  const tagPattern = /\[([^\]]+)\]/g;
  const foundTags = [];
  const invalidTags = [];
  
  let match;
  while ((match = tagPattern.exec(content)) !== null) {
    const tag = match[0];
    foundTags.push(tag);
    
    // Check if tag is in our supported list
    const supportedTags = [
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
    
    if (!supportedTags.includes(tag)) {
      invalidTags.push(tag);
    }
  }
  
  return {
    isValid: invalidTags.length === 0,
    foundTags: [...new Set(foundTags)],
    invalidTags: [...new Set(invalidTags)],
    supportedTags
  };
}