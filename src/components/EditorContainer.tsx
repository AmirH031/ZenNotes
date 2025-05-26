import React, { useState, useEffect } from 'react';
import RichTextEditor from './Editor/RichTextEditor';
import FlipBook from './Editor/FlipBook';
import ZenModeToggle from './ZenMode/ZenModeToggle';
import EditorTimer from './Editor/EditorTimer';
import { useAppContext } from '../context/AppContext';
import { Book, FileDown, X } from 'lucide-react';
import { exportToPDF } from '../utils/exportPdf';

const EditorContainer: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [content, setContent] = useState('');
  const [isFlipBookMode, setIsFlipBookMode] = useState(false);
  const activeNote = state.notes.find(note => note.id === state.activeNoteId);
  const previewRef = React.useRef<HTMLDivElement>(null);
  
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

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !activeNote) return;

    const success = await exportToPDF({
      element: previewRef.current,
      filename: `${activeNote.title}.pdf`,
      theme: state.theme
    });

    if (!success) {
      console.error('Failed to generate PDF');
    }
  };

  if (isFlipBookMode) {
    return (
      <div className="flex-grow relative">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFlipBookMode}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Exit book view"
              >
                <X size={18} />
                <span className="text-sm font-medium">Exit Book View</span>
              </button>
              <EditorTimer />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Download as PDF"
              >
                <FileDown size={18} />
                <span className="text-sm">PDF</span>
              </button>
              <ZenModeToggle />
            </div>
          </div>
        </div>
        
        <div className="pt-20">
          <FlipBook content={content} onContentChange={handleContentChange} />
        </div>
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
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Enter book view"
            >
              <Book size={16} />
              <span className="text-sm">Book View</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Download as PDF"
            >
              <FileDown size={16} />
              <span className="text-sm">PDF</span>
            </button>
            <ZenModeToggle />
          </div>
        </div>
      )}
      
      <div className="flex-grow">
        <RichTextEditor onContentChange={handleContentChange} />
      </div>
    </div>
  );
};

export default EditorContainer;