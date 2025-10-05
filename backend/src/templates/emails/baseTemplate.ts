import { EmailTemplateOptions } from './types';

/**
 * Base email layout template with consistent branding and styling
 */
export const createBaseEmailTemplate = (options: EmailTemplateOptions): string => {
  const {
    title,
    content,
    alertType = 'info',
    alertMessage,
    details = [],
    footerMessage = 'Thank you for choosing Tutorly',
    ctaButton
  } = options;

  // Alert colors mapping
  const alertColors = {
    success: { bg: '#ecfdf5', border: '#10b981', text: '#065f46' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
  };

  const alertStyle = alertColors[alertType];

  // CTA button styling
  const buttonColor = ctaButton?.color || '#2563eb';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: -0.025em;">Tutorly</h1>
          <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Online Tutoring Platform</p>
        </div>
        
        <!-- Title -->
        <h2 style="color: #111827; margin-bottom: 20px; font-size: 24px; font-weight: 600;">${title}</h2>
        
        <!-- Main Content -->
        <div style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${content}
        </div>
        
        ${alertMessage ? `
        <!-- Alert Message -->
        <div style="background-color: ${alertStyle.bg}; border-left: 4px solid ${alertStyle.border}; padding: 16px; margin: 24px 0; border-radius: 6px;">
          <p style="color: ${alertStyle.text}; margin: 0; font-size: 16px; font-weight: 600;">${alertMessage}</p>
        </div>
        ` : ''}
        
        ${details.length > 0 ? `
        <!-- Details Section -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
          <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Details:</h3>
          ${details.map(detail => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280; font-weight: 500;">${detail.label}:</span>
              <span style="color: #111827; font-weight: 600;">${detail.value}</span>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${ctaButton ? `
        <!-- Call to Action Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${ctaButton.url}" style="
            display: inline-block;
            background-color: ${buttonColor};
            color: white;
            padding: 12px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
          ">${ctaButton.text}</a>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">${footerMessage}</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
            This email was sent from Tutorly. If you have any questions, please contact our support team.
          </p>
        </div>
        
      </div>
    </div>
  `;
};

/**
 * Generate plain text version from HTML content
 */
export const generatePlainText = (options: EmailTemplateOptions): string => {
  const {
    title,
    content,
    alertMessage,
    details = [],
    footerMessage = 'Thank you for choosing Tutorly',
    ctaButton
  } = options;

  let text = `TUTORLY - Online Tutoring Platform\n\n`;
  text += `${title}\n${'='.repeat(title.length)}\n\n`;
  
  // Remove HTML tags from content for plain text
  const plainContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  text += `${plainContent}\n\n`;
  
  if (alertMessage) {
    text += `IMPORTANT: ${alertMessage}\n\n`;
  }
  
  if (details.length > 0) {
    text += `Details:\n`;
    text += '-'.repeat(20) + '\n';
    details.forEach(detail => {
      text += `${detail.label}: ${detail.value}\n`;
    });
    text += '\n';
  }
  
  if (ctaButton) {
    text += `${ctaButton.text}: ${ctaButton.url}\n\n`;
  }
  
  text += `${footerMessage}\n`;
  text += `This email was sent from Tutorly. If you have any questions, please contact our support team.`;
  
  return text;
};