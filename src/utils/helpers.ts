/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Format date to display in a readable format
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

/**
 * Count words in text
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Count characters in text (excluding whitespace)
 */
export const countCharacters = (text: string): number => {
  return text.replace(/\s/g, '').length;
};

/**
 * Get reading time estimate (based on average 200 words per minute)
 */
export const getReadingTime = (text: string): string => {
  const wordsPerMinute = 200;
  const wordCount = countWords(text);
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

/**
 * Insert text at cursor position in textarea
 */
export const insertTextAtCursor = (
  textarea: HTMLTextAreaElement,
  textBefore: string,
  textAfter: string = ''
): void => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const newText = 
    textarea.value.substring(0, start) + 
    textBefore + 
    selectedText + 
    textAfter + 
    textarea.value.substring(end);
  
  textarea.value = newText;
  
  // Move the cursor position to after the inserted text
  const newCursorPos = start + textBefore.length + selectedText.length + textAfter.length;
  textarea.selectionStart = newCursorPos;
  textarea.selectionEnd = newCursorPos;
  
  // Focus on the textarea
  textarea.focus();
};