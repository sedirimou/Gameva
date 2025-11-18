/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
        // Disable version check notifications
        config.versionCheck = false;
        
        // Define changes to default configuration here.
        // For complete reference see:
        // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html

        // Enhanced toolbar with text alignment options
        config.toolbar = [
                { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline'] },
                { name: 'paragraph', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                { name: 'links', items: ['Link', 'Unlink'] },
                { name: 'lists', items: ['NumberedList', 'BulletedList'] },
                { name: 'tools', items: ['Source'] }
        ];

        // Enable justify plugin (it's included by default in CKEditor)
        config.extraPlugins = 'justify';

        // Set the most common block elements.
        config.format_tags = 'p;h1;h2;h3;pre';

        // Height for editors
        config.height = 150;

        // Remove unnecessary plugins (but keep justify)
        config.removePlugins = 'elementspath';

        // Allow text-align styles in content
        config.allowedContent = true;

        // Simplify the dialog windows.
        config.removeDialogTabs = 'image:advanced;link:advanced';
};