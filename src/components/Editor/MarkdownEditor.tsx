import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import MarkdownToolbar from './MarkdownToolbar';
import { countWords, countCharacters, formatDate } from '../../utils/helpers';

interface MarkdownEditorProps {
  onContentChange: (content: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ onContentChange }) => {
  const { state, dispatch } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeNote = state.notes.find(note => note.id === state.activeNoteId);
  const [stats, setStats] = useState({ words: 0, chars: 0 });
  
  // Handle content changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    
    if (activeNote) {
      dispatch({
        type: 'UPDATE_NOTE',
        payload: { id: activeNote.id, content },
      });
      
      onContentChange(content);
      
      // Update stats
      setStats({
        words: countWords(content),
        chars: countCharacters(content),
      });
    }
  };

  // Set initial content and focus textarea
  useEffect(() => {
    if (textareaRef.current && activeNote) {
      // Update stats for initial content
      setStats({
        words: countWords(activeNote.content),
        chars: countCharacters(activeNote.content),
      });
      
      // Auto-focus in zen mode
      if (state.zenMode === 'on') {
        textareaRef.current.focus();
      }
    }
  }, [activeNote, state.zenMode]);

  if (!activeNote) {
    return <div className="flex items-center justify-center h-full">No note selected</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <MarkdownToolbar textareaRef={textareaRef} />
      
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        <textarea
          ref={textareaRef}
          value={activeNote.content}
          onChange={handleChange}
          className="flex-grow w-full p-4 font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 focus:outline-none resize-none"
          spellCheck="true"
          placeholder="Start writing in Markdown..."
        />
        
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <div>
            <span>{stats.words} words</span>
            <span className="mx-2">•</span>
            <span>{stats.chars} characters</span>
          </div>
          <div>
            <span>Last updated: {formatDate(activeNote.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;