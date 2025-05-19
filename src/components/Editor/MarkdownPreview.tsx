import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownPreviewProps {
  content: string;
  previewRef?: React.RefObject<HTMLDivElement>;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, previewRef }) => {
  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-900 p-6">
      <div ref={previewRef} className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownPreview;