import React, { useMemo, useState, useEffect } from 'react';
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
  const [showToolbar, setShowToolbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Toolbar hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowToolbar(currentScrollY <= lastScrollY || currentScrollY <= 0);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const pages = useMemo(() => {
    return notes.map((note) => ({
      id: note.id,
      content: note.content,
    }));
  }, [notes]);

  // Force layout refresh after flip
  const handlePageFlip = () => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-800">
      {/* Fixed Toolbar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-opacity duration-300 ${
          showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 p-2 backdrop-blur-md`}
        role="toolbar"
        aria-label="Book view controls"
      >
        {/* Add buttons here if needed */}
      </div>

      {/* Book below toolbar */}
    <div className="fixed inset-0 top-20 bg-gray-900 flex justify-center items-center perspective-[2500px]">
  <HTMLFlipBook
    width={500}
    height={700}
    size="stretch"
    minWidth={300}
    maxWidth={1000}
    minHeight={400}
    maxHeight={1000}
    showCover={true}
    className="shadow-2xl rounded-lg transition-transform duration-500 ease-in-out"
    flippingTime={1000}
    maxShadowOpacity={0.5}
    useMouseEvents={true}
    clickEventForward={true}
    onFlip={handlePageFlip}
  >
    {pages.map((page, index) => (
      <div
        key={page.id}
        className="relative bg-white dark:bg-gray-900 overflow-hidden"
        role="article"
        aria-label={`Page ${index + 1} of ${pages.length}`}
      >
        <div className="absolute bottom-4 right-4 text-sm text-gray-500 dark:text-gray-400">
          Page {index + 1} of {pages.length}
        </div>
        <div className="p-6 pb-16 min-h-[90%] overflow-y-auto max-h-full">
          <MarkdownPreview content={page.content} />
        </div>
      </div>
    ))}
  </HTMLFlipBook>
</div>

    </div>
  );
};

export default FlipBook;
