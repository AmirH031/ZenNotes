import React, { useState } from 'react';
import { FilePlus, Trash, Menu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { formatDate, countWords } from '../../utils/helpers';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { state, dispatch } = useAppContext();
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCreateNote = () => {
    dispatch({
      type: 'CREATE_NOTE',
      payload: {
        title: 'Untitled Note',
        content: '# Untitled Note\n\nStart writing here...',
      },
    });
  };

  const handleSelectNote = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_NOTE', payload: id });
    setIsMobileMenuOpen(false);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.notes.length <= 1) {
      alert('You cannot delete the last note. Create another note first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch({ type: 'DELETE_NOTE', payload: id });
    }
  };

  const startRenaming = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(id);
    setNewTitle(currentTitle);
  };

  const handleRename = (id: string) => {
    if (newTitle.trim()) {
      dispatch({
        type: 'UPDATE_NOTE',
        payload: { id, title: newTitle.trim() },
      });
    }
    setIsRenaming(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleRename(id);
    } else if (e.key === 'Escape') {
      setIsRenaming(null);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button - Now positioned in the header area */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-2 m-2">
        <button
          className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen md:h-[calc(100vh-3.5rem)] overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${
          isOpen && (isMobileMenuOpen || window.innerWidth >= 768)
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Notes</h2>
            <button
              onClick={handleCreateNote}
              className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              aria-label="Create new note"
            >
              <FilePlus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {state.notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note.id)}
                className={`group px-3 py-2 rounded-md cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.02] ${
                  state.activeNoteId === note.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  {isRenaming === note.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => handleRename(note.id)}
                      onKeyDown={(e) => handleKeyDown(e, note.id)}
                      autoFocus
                      className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-sm font-medium truncate ${
                          state.activeNoteId === note.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}
                        onDoubleClick={(e) => startRenaming(note.id, note.title, e)}
                      >
                        {note.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-red-500 focus:outline-none transition-opacity duration-200"
                        aria-label="Delete note"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5 mt-1 pl-1">
                  <p>🕒 Created: {formatDate(note.createdAt)}</p>
                  <p>✏️ Updated: {formatDate(note.updatedAt)}</p>
                  <p>📝 Words: {countWords(note.content)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;