// src/components/MessageBubble.js
"use client";

import React from 'react';
import { motion } from 'framer-motion';
// No need to import TypingText if it's not used here anymore:
// import TypingText from './TypingText';

// Import React Markdown components
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';


const MessageBubble = ({ message, sender }) => {
  const isUser = sender === 'user';
  // NEW: Flag to explicitly identify AI messages for Markdown rendering
  const isAIMessage = sender === 'ai';

  return (
    <motion.div
      className={`d-flex mb-2 ${
        isUser ? 'justify-content-end' : 'justify-content-start'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`rounded py-2 px-3 ${
          isUser
            ? 'bg-primary text-white' // User message styling
            : 'bg-light text-dark'   // AI and System message styling
        }`}
        style={{ maxWidth: '75%' }}
      >
        {/* Conditional rendering based on sender type */}
        {isUser || sender === 'system' ? ( // If it's a user or system message, render as plain text
          message
        ) : isAIMessage ? ( // If it's an AI message, render with ReactMarkdown
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                // Custom components for styling Markdown elements with Bootstrap
                pre: ({node, ...props}) => <pre className="p-2 my-2 rounded bg-dark text-white" {...props} />,
                code: ({node, inline, ...props}) => {
                    if (inline) return <code className="bg-secondary rounded px-1" {...props} />;
                    return <code className="d-block text-white overflow-auto" {...props} />;
                },
                ul: ({node, ...props}) => <ul className="list-unstyled ps-3" {...props} />,
                ol: ({node, ...props}) => <ol className="ps-3" {...props} />,
                p: ({node, ...props}) => <p className="mb-1" {...props} />,
                a: ({node, ...props}) => <a className="text-info text-decoration-none" {...props} />,
                h1: ({node, ...props}) => <h5 className="mt-3 mb-1" {...props} />,
                h2: ({node, ...props}) => <h6 className="mt-2 mb-1" {...props} />,
                h3: ({node, ...props}) => <small className="d-block text-muted mb-1" {...props} />,
                strong: ({node, ...props}) => <strong className="fw-bold" {...props} />,
                em: ({node, ...props}) => <em className="fst-italic" {...props} />,
            }}
          >
            {message}
          </ReactMarkdown>
        ) : (
          // Fallback for any other unexpected sender type, just render as plain text
          message
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;