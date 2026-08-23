"use client";

import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

export function ChatMessage({ content, isUser }: ChatMessageProps) {
  if (isUser) {
    // User messages: plain text, no markdown needed
    return <span className="break-words">{content}</span>;
  }

  // AI messages: full markdown rendering
  return (
    <ReactMarkdown
      components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),

        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-espresso">{children}</strong>
        ),

        // Italic
        em: ({ children }) => (
          <em className="italic text-espresso/80">{children}</em>
        ),

        // Ordered list — renders "1. 2. 3." as a proper styled list
        ol: ({ children }) => (
          <ol className="mt-2 mb-2 space-y-1.5 pl-1">{children}</ol>
        ),
        // Unordered list
        ul: ({ children }) => (
          <ul className="mt-2 mb-2 space-y-1.5 pl-1">{children}</ul>
        ),

        // List items
        li: ({ children, ...props }) => {
          // Detect if parent is ordered or unordered
          const isOrdered = (props as any).ordered;
          const index = (props as any).index;
          return (
            <li className="flex items-start gap-2.5">
              {/* Custom bullet / number */}
              <span
                className={`flex-shrink-0 mt-0.5 ${
                  isOrdered
                    ? "min-w-[20px] h-5 flex items-center justify-center rounded-full bg-gold/15 text-[10px] font-bold text-gold leading-none"
                    : "w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"
                }`}
              >
                {isOrdered ? (index ?? 0) + 1 : ""}
              </span>
              <span className="flex-1 leading-relaxed">{children}</span>
            </li>
          );
        },

        // Headings — keep them subtle inside a chat bubble
        h1: ({ children }) => (
          <h1 className="font-serif font-bold text-base text-espresso mt-3 mb-1.5 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="font-semibold text-sm text-espresso mt-2.5 mb-1 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-semibold text-xs text-espresso mt-2 mb-0.5 first:mt-0 uppercase tracking-wide">{children}</h3>
        ),

        // Inline code
        code: ({ children }) => (
          <code className="px-1.5 py-0.5 rounded bg-espresso/10 text-espresso font-mono text-[11px]">
            {children}
          </code>
        ),

        // Horizontal rule
        hr: () => <hr className="my-2 border-border" />,

        // Blockquote — use for highlighted info
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-gold pl-3 my-2 text-subtext italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
