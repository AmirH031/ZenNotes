import html2pdf from 'html2pdf.js';
import { ThemeMode } from '../types';

interface ExportPDFOptions {
  element: HTMLElement;
  filename: string;
  theme: ThemeMode;
}

export const exportToPDF = async ({ element, filename, theme }: ExportPDFOptions): Promise<boolean> => {
  try {
    // Create a clone of the content to avoid modifying the original
    const container = document.createElement('div');
    container.className = 'pdf-container';
    
    // Clone the content
    const content = element.cloneNode(true) as HTMLElement;
    
    // Apply base styles
    const baseStyles = document.createElement('style');
    baseStyles.textContent = `
      .pdf-container {
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
        color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: 'Merriweather', serif;
        line-height: 1.3;
        margin-top: 2em;
        margin-bottom: 1em;
        color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        break-after: avoid;
      }

      pre {
        background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
        border-radius: 6px;
        padding: 16px;
        margin: 16px 0;
        overflow-x: auto;
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        page-break-inside: avoid;
      }

      code {
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
        color: ${theme === 'dark' ? '#ffffff' : '#000000'};
      }

      p {
        margin-bottom: 1.5em;
        orphans: 3;
        widows: 3;
      }

      img {
        max-width: 100%;
        height: auto;
        margin: 20px 0;
        page-break-inside: avoid;
      }

      ul, ol {
        margin: 1em 0;
        padding-left: 2em;
      }

      li {
        margin-bottom: 0.5em;
      }

      blockquote {
        border-left: 4px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        padding-left: 1em;
        margin: 1.5em 0;
        font-style: italic;
        color: ${theme === 'dark' ? '#9ca3af' : '#4b5563'};
        page-break-inside: avoid;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5em 0;
        page-break-inside: avoid;
      }

      th, td {
        border: 1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
        font-weight: 600;
      }

      hr {
        border: 0;
        border-top: 1px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
        margin: 2em 0;
      }

      @media print {
        @page {
          margin: 0.5in;
        }
        
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `;

    // Add the styles and content to the container
    container.appendChild(baseStyles);
    container.appendChild(content);

    // Configure html2pdf options
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5], // inches
      filename: filename,
      image: { 
        type: 'jpeg', 
        quality: 1.0 
      },
      html2canvas: {
        scale: 3, // Increased for better quality
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        windowWidth: 1200, // Fixed width for consistent rendering
        onclone: (doc) => {
          // Ensure fonts are loaded
          const link = doc.createElement('link');
          link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap';
          link.rel = 'stylesheet';
          doc.head.appendChild(link);
        }
      },
      jsPDF: {
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
        compress: true,
        precision: 16,
        hotfixes: ['px_scaling']
      }
    };

    // Generate and save the PDF
    await html2pdf().from(container).set(options).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};