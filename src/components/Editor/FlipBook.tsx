import React, { useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import MarkdownPreview from './MarkdownPreview';
import { useAppContext } from '../../context/AppContext';

interface FlipBookProps {
  content: string;
  onContentChange: (content: string) => void;
}

const FlipBook: React.FC<FlipBookProps> = ({ content }) => {
  const { state } = useAppContext();
  const notes = state.notes;

  // Split notes into pages of content
  const pages = useMemo(() => {
    return notes.map((note) => ({
      id: note.id,
      content: note.content,
    }));
  }, [notes]);

  return (
    <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <HTMLFlipBook
        width={500}
        height={700}
        size="stretch"
        minWidth={300}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1000}
        showCover={true}
        className="shadow-2xl"
      >
        {pages.map((page, index) => (
          <div key={page.id} className="relative bg-white dark:bg-gray-900">
            <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
              Page {index + 1} of {pages.length}
            </div>
            <div className="p-4 pb-12"> {/* Added padding at bottom for page number */}
              <MarkdownPreview content={page.content} />
            </div>
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default FlipBook;