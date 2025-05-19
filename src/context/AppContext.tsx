import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState, Note, SoundType, ThemeMode, ZenMode } from '../types';
import { generateId } from '../utils/helpers';

// Define action types
type Action =
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_ACTIVE_NOTE'; payload: string }
  | { type: 'CREATE_NOTE'; payload: { title: string; content: string } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; title?: string; content?: string } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_ZEN_MODE'; payload: ZenMode }
  | { type: 'SET_SOUND'; payload: SoundType };

// Initial state
const initialState: AppState = {
  notes: [],
  activeNoteId: null,
  theme: 'light',
  zenMode: 'off',
  soundType: 'none',
};

// Context setup
interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Reducer function
const reducer = (state: AppState, action: Action): AppState => {
  const now = new Date().toISOString();

  switch (action.type) {
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload,
      };
    case 'SET_ACTIVE_NOTE':
      return {
        ...state,
        activeNoteId: action.payload,
      };
    case 'CREATE_NOTE': {
      const newNote: Note = {
        id: generateId(),
        title: action.payload.title,
        content: action.payload.content,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...state,
        notes: [...state.notes, newNote],
        activeNoteId: newNote.id,
      };
    }
    case 'UPDATE_NOTE': {
      const { id, title, content } = action.payload;
      const updatedNotes = state.notes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            ...(title !== undefined ? { title } : {}),
            ...(content !== undefined ? { content } : {}),
            updatedAt: now,
          };
        }
        return note;
      });
      return {
        ...state,
        notes: updatedNotes,
      };
    }
    case 'DELETE_NOTE': {
      const filteredNotes = state.notes.filter((note) => note.id !== action.payload);
      return {
        ...state,
        notes: filteredNotes,
        activeNoteId: filteredNotes.length > 0 ? filteredNotes[0].id : null,
      };
    }
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_ZEN_MODE':
      return {
        ...state,
        zenMode: action.payload,
      };
    case 'SET_SOUND':
      return {
        ...state,
        soundType: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('markWriteState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as AppState;
        dispatch({ type: 'SET_NOTES', payload: parsedState.notes });
        
        // Set active note if available, otherwise default to first note or null
        const activeId = parsedState.activeNoteId && 
          parsedState.notes.some(note => note.id === parsedState.activeNoteId) 
          ? parsedState.activeNoteId 
          : parsedState.notes.length > 0 ? parsedState.notes[0].id : null;
        
        dispatch({ type: 'SET_ACTIVE_NOTE', payload: activeId });
        dispatch({ type: 'SET_THEME', payload: parsedState.theme || 'light' });
      } catch (error) {
        console.error('Error parsing saved state', error);
      }
    } else {
      // Create default note if no saved notes
      dispatch({
        type: 'CREATE_NOTE',
        payload: {
          title: 'Welcome to MarkWrite',
          content: `# Welcome to MarkWrite!\n\nThis is a distraction-free Markdown editor with live preview.\n\n## Features\n\n- **Split-screen** layout with live preview\n- **Markdown toolbar** for formatting\n- **Live stats** for word and character count\n- **LocalStorage** for saving your notes\n- **Theme toggle** for light and dark mode\n- **Zen mode** for distraction-free writing\n\nEnjoy writing!`,
        },
      });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state.notes.length > 0) {
      localStorage.setItem('markWriteState', JSON.stringify(state));
    }
  }, [state]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};