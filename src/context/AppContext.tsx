import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AppState, Note, SoundType, ThemeMode, ZenMode } from '../types';
import { generateId } from '../utils/helpers';

type Action =
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_ACTIVE_NOTE'; payload: string }
  | { type: 'CREATE_NOTE'; payload: { title: string; content: string } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; title?: string; content?: string } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_ZEN_MODE'; payload: ZenMode }
  | { type: 'SET_SOUND'; payload: SoundType }
  | { type: 'TOGGLE_PREVIEW'; payload?: boolean }
  | { type: 'SET_EDITOR_HEIGHT'; payload: number }
  | { type: 'SET_PREVIEW_HEIGHT'; payload: number };

const initialState: AppState = {
  notes: [],
  activeNoteId: null,
  theme: 'light',
  zenMode: 'off',
  soundType: 'none',
  previewVisible: true,
  editorHeight: 50,
  previewHeight: 50,
};

interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

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
    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        previewVisible: action.payload !== undefined ? action.payload : !state.previewVisible,
      };
    case 'SET_EDITOR_HEIGHT':
      return {
        ...state,
        editorHeight: action.payload,
      };
    case 'SET_PREVIEW_HEIGHT':
      return {
        ...state,
        previewHeight: action.payload,
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedState = localStorage.getItem('markWriteState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState) as AppState;
        dispatch({ type: 'SET_NOTES', payload: parsedState.notes });
        
        const activeId = parsedState.activeNoteId && 
          parsedState.notes.some(note => note.id === parsedState.activeNoteId) 
          ? parsedState.activeNoteId 
          : parsedState.notes.length > 0 ? parsedState.notes[0].id : null;
        
        dispatch({ type: 'SET_ACTIVE_NOTE', payload: activeId });
        dispatch({ type: 'SET_THEME', payload: parsedState.theme || 'light' });
        dispatch({ type: 'TOGGLE_PREVIEW', payload: parsedState.previewVisible });
        dispatch({ type: 'SET_EDITOR_HEIGHT', payload: parsedState.editorHeight });
        dispatch({ type: 'SET_PREVIEW_HEIGHT', payload: parsedState.previewHeight });
      } catch (error) {
        console.error('Error parsing saved state', error);
      }
    } else {
      dispatch({
        type: 'CREATE_NOTE',
        payload: {
          title: 'Welcome to ZenNotes',
          content: `<h1>Welcome to ZenNotes</h1>
<p>Your personal space for distraction-free writing and creative expression.</p>
<hr>
<h2>Key Features</h2>
<ul>
  <li>Clean, intuitive rich text editor</li>
  <li>Real-time word and character counting</li>
  <li>Automatic saving to local storage</li>
  <li>Dark mode for comfortable night writing</li>
  <li>Zen mode with ambient sounds for focus</li>
  <li>Book view for a different reading experience</li>
  <li>Export your work to PDF</li>
</ul>
<hr>
<h2>Getting Started</h2>
<p>Use the toolbar above to format your text. You can create:</p>
<ul>
  <li>Headers for structure</li>
  <li>Lists for organization</li>
  <li>Quotes for emphasis</li>
  <li>Code blocks for technical content</li>
</ul>
<blockquote>
  <p>"The scariest moment is always just before you start." - Stephen King</p>
</blockquote>
<p>Ready to begin your writing journey? Create a new note using the + button in the sidebar and start writing!</p>`,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (state.notes.length > 0) {
      localStorage.setItem('markWriteState', JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};