import React, { useRef } from 'react';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code, Link, AlignLeft, Underline, Undo, Redo, FlipHorizontal as HorizontalRule, Copy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({ textareaRef }) => {
  const { state } = useAppContext();
  const activeNote = state.notes.find(note => note.id === state.activeNoteId);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMarkdownAction = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = 
      textarea.value.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      textarea.value.substring(end);
    
    textarea.value = newText;
    
    // Update the textarea value
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Set the cursor position
    const newCursorPos = start + before.length + selectedText.length + after.length;
    textarea.focus();
    textarea.setSelectionRange(
      selectedText ? start + before.length : start + before.length,
      selectedText ? end + before.length : start + before.length
    );
  };

  const insertHeading = (level: number) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
    const prefix = '#'.repeat(level) + ' ';
    
    // Check if the line already starts with the heading syntax
    const lineText = textarea.value.substring(lineStart, start);
    const hasHeadingPrefix = /^#{1,6}\s/.test(lineText);
    
    if (hasHeadingPrefix) {
      // Replace existing heading
      const newText = 
        textarea.value.substring(0, lineStart) + 
        prefix + 
        textarea.value.substring(lineStart).replace(/^#{1,6}\s/, '');
      
      textarea.value = newText;
    } else {
      // Add heading prefix
      const newText = 
        textarea.value.substring(0, lineStart) + 
        prefix + 
        textarea.value.substring(lineStart);
      
      textarea.value = newText;
    }
    
    // Update the textarea value
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Set the cursor position
    textarea.focus();
  };

  const insertLink = () => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
      handleMarkdownAction('[', '](url)');
    } else {
      handleMarkdownAction('[text](url)');
    }
  };

  const copyToClipboard = async () => {
    if (!activeNote) return;
    
    try {
      await navigator.clipboard.writeText(activeNote.content);
      console.log('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const toolbarButtons: ToolbarButton[] = [
    { icon: <Bold size={18} />, label: 'Bold', action: () => handleMarkdownAction('**', '**') },
    { icon: <Italic size={18} />, label: 'Italic', action: () => handleMarkdownAction('*', '*') },
    { icon: <Heading1 size={18} />, label: 'Heading 1', action: () => insertHeading(1) },
    { icon: <Heading2 size={18} />, label: 'Heading 2', action: () => insertHeading(2) },
    { icon: <List size={18} />, label: 'Bullet List', action: () => handleMarkdownAction('- ') },
    { icon: <ListOrdered size={18} />, label: 'Numbered List', action: () => handleMarkdownAction('1. ') },
    { icon: <Quote size={18} />, label: 'Quote', action: () => handleMarkdownAction('> ') },
    { icon: <Code size={18} />, label: 'Code', action: () => handleMarkdownAction('`', '`') },
    { icon: <Link size={18} />, label: 'Link', action: insertLink },
    { icon: <HorizontalRule size={18} />, label: 'Horizontal Rule', action: () => handleMarkdownAction('\n\n---\n\n') },
    { icon: <Copy size={18} />, label: 'Copy to Clipboard', action: copyToClipboard }
  ];

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap items-center gap-1">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            title={button.label}
            aria-label={button.label}
          >
            {button.icon}
          </button>
        ))}
      </div>
      
      {/* Hidden preview element for PDF generation */}
      <div ref={previewRef} style={{ display: 'none' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {activeNote?.content || ''}
        </ReactMarkdown>
      </div>
    </>
  );
};

export default MarkdownToolbar;