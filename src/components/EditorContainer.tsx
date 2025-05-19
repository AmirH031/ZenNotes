import React, { useState } from 'react';
import MarkdownEditor from './Editor/MarkdownEditor';
import MarkdownPreview from './Editor/MarkdownPreview';
import FlipBook from './Editor/FlipBook';
import ZenModeToggle from './ZenMode/ZenModeToggle';
import EditorTimer from './Editor/EditorTimer';
import { useAppContext } from '../context/AppContext';
import { Book, FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const EditorContainer: React.FC = () => {
  const { state } = useAppContext();
  const [content, setContent] = useState('');
  const [isFlipBookMode, setIsFlipBookMode] = useState(false);
  const activeNote = state.notes.find(note => note.id === state.activeNoteId);
  const previewRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content);
    }
  }, [activeNote]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const toggleFlipBookMode = () => {
    setIsFlipBookMode(!isFlipBookMode);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !activeNote) return;

    const element = previewRef.current;
    
    const opt = {
      margin: [10, 10],
      filename: `${activeNote.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      }
    };

    try {
      // Create a temporary container with the preview content
      const container = document.createElement('div');
      container.className = 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto p-8';
      container.style.maxWidth = '800px';
      container.style.margin = '0 auto';
      
      // Clone the preview content
      const previewContent = element.cloneNode(true) as HTMLElement;
      container.appendChild(previewContent);
      
      // Add required styles
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Merriweather', serif;
        }
        
        pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        
        code {
          background-color: #f3f4f6;
          padding: 0.25rem;
          border-radius: 0.25rem;
        }
      `;
      container.appendChild(styleSheet);

      await html2pdf().from(container).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {state.zenMode === 'off' && (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-4">
            <EditorTimer />
            <button
              onClick={toggleFlipBookMode}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Book size={16} />
              <span className="text-sm">{isFlipBookMode ? 'Split View' : 'Book View'}</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              title="Download as PDF"
            >
              <FileDown size={16} />
              <span className="text-sm">PDF</span>
            </button>
            <ZenModeToggle />
          </div>
        </div>
      )}
      
      {isFlipBookMode ? (
        <div className="flex-grow">
          <FlipBook content={content} onContentChange={handleContentChange} />
        </div>
      ) : (
        <div className="flex-grow flex flex-col md:flex-row h-full overflow-hidden">
          <div className="h-1/2 md:h-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
            <MarkdownEditor onContentChange={handleContentChange} />
          </div>
          <div className="h-1/2 md:h-full md:w-1/2">
            <MarkdownPreview content={content} previewRef={previewRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorContainer;