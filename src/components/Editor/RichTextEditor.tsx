import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Code, Quote, ListOrdered, List, Heading1, Heading2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { countWords, countCharacters, formatDate } from '../../utils/helpers';

interface RichTextEditorProps {
  onContentChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ onContentChange }) => {
  const { state, dispatch } = useAppContext();
  const activeNote = state.notes.find(note => note.id === state.activeNoteId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm my-4',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: activeNote?.content || '',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      if (activeNote) {
        dispatch({
          type: 'UPDATE_NOTE',
          payload: { id: activeNote.id, content },
        });
        onContentChange(content);
        
        const doc = new DOMParser().parseFromString(content, 'text/html');
        let newTitle = '';
        
        const h1 = doc.querySelector('h1');
        if (h1 && h1.textContent) {
          newTitle = h1.textContent;
        } else {
          const firstParagraph = doc.querySelector('p');
          if (firstParagraph && firstParagraph.textContent) {
            newTitle = firstParagraph.textContent.split('\n')[0];
          }
        }
        
        if (newTitle && newTitle !== activeNote.title) {
          dispatch({
            type: 'UPDATE_NOTE',
            payload: { id: activeNote.id, title: newTitle },
          });
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-12rem)] px-8 py-6',
      },
    },
  });

  useEffect(() => {
    if (editor && activeNote) {
      if (editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content);
      }
    }
  }, [activeNote, editor]);

  if (!editor || !activeNote) {
    return null;
  }

  const stats = {
    words: countWords(editor.getText()),
    chars: countCharacters(editor.getText()),
  };

  const MenuButton = ({ onClick, active, icon: Icon, label }: any) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-2 rounded-md transition-colors ${
        active
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={label}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon={Bold}
          label="Bold"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon={Italic}
          label="Italic"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          icon={UnderlineIcon}
          label="Underline"
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          label="Heading 1"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          label="Heading 2"
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon={List}
          label="Bullet List"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon={ListOrdered}
          label="Numbered List"
        />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          icon={Quote}
          label="Quote"
        />
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          icon={Code}
          label="Code Block"
        />
        <MenuButton
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          active={editor.isActive('link')}
          icon={LinkIcon}
          label="Add Link"
        />
      </div>

      <div className="flex-grow overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <div className="sticky bottom-0 p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
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
  );
};

export default RichTextEditor;