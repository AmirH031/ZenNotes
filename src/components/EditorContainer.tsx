import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MarkdownEditor from './Editor/MarkdownEditor';
import MarkdownPreview from './Editor/MarkdownPreview';
import FlipBook from './Editor/FlipBook';
import ZenModeToggle from './ZenMode/ZenModeToggle';
import EditorTimer from './Editor/EditorTimer';
import { useAppContext } from '../context/AppContext';
import { Book, FileDown, Eye, EyeOff } from 'lucide-react';
import { exportToPDF } from '../utils/exportPdf';

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

    const success = await exportToPDF({
      element: previewRef.current,
      filename: `${activeNote.title}.pdf`,
      theme: state.theme
    });

    if (!success) {
      // Handle error - could add toast notification here
      console.error('Failed to generate PDF');
    }
  };

  if (isFlipBookMode) {
    return (
      <div className="flex-grow">
        <FlipBook content={content} onContentChange={handleContentChange} />
      </div>
    );
  }

  if (isMobile) {
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
                <span className="text-sm">Book View</span>
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={togglePreview}
                className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                title={state.previewVisible ? "Hide Preview" : "Show Preview"}
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
        
        <PanelGroup direction="vertical" className="flex-grow">
          <Panel defaultSize={50} minSize={20}>
            <MarkdownEditor onContentChange={handleContentChange} />
          </Panel>
          
          {state.previewVisible && (
            <>
              <PanelResizeHandle className="resize-handle" />
              <Panel defaultSize={50} minSize={20}>
                <MarkdownPreview content={content} previewRef={previewRef} />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {state.zenMode === 'off' && (
        <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <EditorTimer />
            <button
              onClick={toggleFlipBookMode}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Book size={16} />
              <span className="text-sm">Book View</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePreview}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              title={state.previewVisible ? "Hide Preview" : "Show Preview"}
            >
              {state.previewVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="text-sm">
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
      
      <div className="flex-grow flex">
        <div className={`h-full ${state.previewVisible ? 'w-1/2' : 'w-full'}`}>
          <MarkdownEditor onContentChange={handleContentChange} />
        </div>
        
        {state.previewVisible && (
          <div className="w-1/2 h-full border-l border-gray-200 dark:border-gray-700">
            <MarkdownPreview content={content} previewRef={previewRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorContainer;