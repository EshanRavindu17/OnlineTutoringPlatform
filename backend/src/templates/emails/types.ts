// Email template interfaces and types
export interface EmailTemplateData {
  [key: string]: any;
}

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export interface EmailTemplateOptions {
  title: string;
  content: string;
  alertType?: 'success' | 'info' | 'warning' | 'error';
  alertMessage?: string;
  details?: { label: string; value: string }[];
  footerMessage?: string;
  ctaButton?: {
    text: string;
    url: string;
    color?: string;
  };
}