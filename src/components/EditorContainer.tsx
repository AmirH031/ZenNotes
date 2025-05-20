import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MarkdownEditor from './Editor/MarkdownEditor';
import MarkdownPreview from './Editor/MarkdownPreview';
import FlipBook from './Editor/FlipBook';
import ZenModeToggle from './ZenMode/ZenModeToggle';
import EditorTimer from './Editor/EditorTimer';
import { useAppContext } from '../context/AppContext';
import { Book, FileDown, Eye, EyeOff } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const EditorContainer: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [content, setContent] = useState('');
  const [isFlipBookMode, setIsFlipBookMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const activeNote = state.notes.find(note => note.id === state.activeNoteId);
  const previewRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
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
      const container = document.createElement('div');
      container.className = 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto p-8';
      container.style.maxWidth = '800px';
      container.style.margin = '0 auto';
      
      const previewContent = element.cloneNode(true) as HTMLElement;
      container.appendChild(previewContent);
      
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

  const handlePanelResize = (sizes: number[]) => {
    if (sizes.length > 0) {
      dispatch({ type: 'SET_EDITOR_HEIGHT', payload: sizes[0] });
      if (sizes.length > 1) {
        dispatch({ type: 'SET_PREVIEW_HEIGHT', payload: sizes[1] });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {state.zenMode === 'off' && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 gap-2">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <EditorTimer />
            <button
              onClick={toggleFlipBookMode}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Book size={16} />
              <span className="text-sm">{isFlipBookMode ? 'Split View' : 'Book View'}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={togglePreview}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              title={state.previewVisible ? "Hide Preview" : "Show Preview"}
              aria-label={state.previewVisible ? "Hide Preview" : "Show Preview"}
            >
              {state.previewVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="text-sm hidden sm:inline">
                {state.previewVisible ? 'Hide Preview' : 'Show Preview'}
              </span>
            </button>
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
        <PanelGroup 
          direction={isMobile ? "vertical" : "horizontal"}
          onLayout={handlePanelResize}
          className="flex-grow"
        >
          <Panel 
            defaultSize={state.editorHeight}
            minSize={20}
            className="h-full"
          >
            <MarkdownEditor onContentChange={handleContentChange} />
          </Panel>
          
          {state.previewVisible && (
            <>
              <PanelResizeHandle className="resize-handle resize-handle-horizontal" />
              <Panel 
                defaultSize={state.previewHeight}
                minSize={20}
                className="h-full transition-all duration-300"
              >
                <MarkdownPreview content={content} previewRef={previewRef} />
              </Panel>
            </>
          )}
        </PanelGroup>
      )}
    </div>
  );
};

export default EditorContainer;