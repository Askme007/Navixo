/**
 * MarkdownRenderer Component
 * 
 * Production-ready Markdown formatter for chat applications
 * Supports: Headings, Lists, Code, Tables, Blockquotes, Images, Abbreviations, Footnotes
 * 
 * Dependencies (install):
 * npm install react-markdown remark-gfm rehype-raw rehype-sanitize
 * 
 * Usage:
 * <MarkdownRenderer 
 *   content={message.content}
 *   streaming={isStreaming}
 *   messageId={message.id}
 *   onCopy={(text) => console.log('Copied:', text)}
 * />
 */

import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { CodeBlock } from './CodeBlock';
import { TableRenderer } from './TableRenderer';
import { ImageRenderer } from './ImageRenderer';
import { FootnotesPanel } from './FootnotesPanel';
import { extractFootnotes, extractAbbreviations } from './utils/parseMarkdown';
import styles from './MarkdownRenderer.module.css';

export interface MarkdownRendererProps {
  content: string;
  theme?: 'dark' | 'light';
  streaming?: boolean;
  messageId?: string;
  onCopy?: (text: string) => void;
}

export function MarkdownRenderer({
  content,
  theme = 'dark',
  streaming = false,
  messageId,
  onCopy
}: MarkdownRendererProps) {
  const [footnotes, setFootnotes] = useState<Array<{ id: string; text: string }>>([]);
  const [abbreviations, setAbbreviations] = useState<Array<{ abbr: string; full: string }>>([]);

  // Extract footnotes and abbreviations
  useEffect(() => {
    const extractedFootnotes = extractFootnotes(content);
    const extractedAbbrs = extractAbbreviations(content);
    
    setFootnotes(extractedFootnotes);
    setAbbreviations(extractedAbbrs);
  }, [content]);

  // Custom sanitize schema to allow abbr, figure, figcaption
  const sanitizeSchema = useMemo(() => ({
    tagNames: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 
               'code', 'pre', 'em', 'strong', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
               'br', 'hr', 'abbr', 'figure', 'figcaption', 'div', 'span'],
    attributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      abbr: ['title'],
      code: ['className'],
      th: ['align'],
      td: ['align'],
      '*': ['className', 'id']
    }
  }), []);

  return (
    <div className={`${styles['markdown-root']} ${streaming ? styles['is-streaming'] : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          // H1 - Largest heading with divider
          h1: ({ node, children, ...props }) => (
            <div className={styles['heading-wrapper']}>
              <hr className={styles['heading-divider']} />
              <h1 className={styles.h1} {...props}>
                {children}
              </h1>
            </div>
          ),
          
          // H2 - Major section heading with divider
          h2: ({ node, children, ...props }) => (
            <div className={styles['heading-wrapper']}>
              <hr className={styles['heading-divider']} />
              <h2 className={styles.h2} {...props}>
                {children}
              </h2>
            </div>
          ),
          
          // H3 - Subsection heading with divider
          h3: ({ node, children, ...props }) => (
            <div className={styles['heading-wrapper']}>
              <hr className={styles['heading-divider']} />
              <h3 className={styles.h3} {...props}>
                {children}
              </h3>
            </div>
          ),
          
          // Paragraphs - avoid wrapping block elements
          p: ({ node, children, ...props }) => {
            // Check if children contain block elements
            const hasBlockChild = React.Children.toArray(children).some((child) => {
              if (React.isValidElement(child)) {
                const type = child.type;
                if (typeof type === 'function') {
                  return true; // Custom components (CodeBlock, etc.)
                }
                if (typeof type === 'string') {
                  return ['div', 'pre', 'table', 'ul', 'ol', 'blockquote'].includes(type);
                }
              }
              return false;
            });

            // If has block children, return a div instead of p to avoid nesting warnings
            if (hasBlockChild) {
              return <div className={styles.paragraph} {...props}>{children}</div>;
            }

            return <p className={styles.paragraph} {...props}>{children}</p>;
          },
          
          // Unordered lists
          ul: ({ node, children, ...props }) => (
            <ul className={styles['ul-list']} {...props}>
              {children}
            </ul>
          ),
          
          // Ordered lists
          ol: ({ node, children, ...props }) => (
            <ol className={styles['ol-list']} {...props}>
              {children}
            </ol>
          ),
          
          // List items
          li: ({ node, ordered, children, ...props }) => (
            <li 
              className={ordered ? styles['li-ordered'] : styles['li-unordered']}
              {...props}
            >
              {children}
            </li>
          ),
          
          // Code blocks and inline code
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Inline code
            if (inline) {
              return (
                <code className={styles['inline-code']} {...props}>
                  {children}
                </code>
              );
            }
            
            // Code block - return CodeBlock component directly (not wrapped in p)
            const codeString = String(children).replace(/\n$/, '');
            return (
              <CodeBlock
                code={codeString}
                language={language}
                onCopy={onCopy}
              />
            );
          },
          
          // Blockquotes
          blockquote: ({ node, children, ...props }) => (
            <blockquote className={styles.blockquote} {...props}>
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ node, children, ...props }) => (
            <TableRenderer {...props}>
              {children}
            </TableRenderer>
          ),
          
          // Images
          img: ({ node, ...props }) => <ImageRenderer {...props} />,
          
          // Links
          a: ({ node, children, ...props }) => (
            <a 
              className={styles.link}
              target="_blank" 
              rel="noopener noreferrer" 
              {...props}
            >
              {children}
            </a>
          ),
          
          // Strong (bold)
          strong: ({ node, children, ...props }) => (
            <strong className={styles.strong} {...props}>
              {children}
            </strong>
          ),
          
          // Emphasis (italic)
          em: ({ node, children, ...props }) => (
            <em className={styles.em} {...props}>
              {children}
            </em>
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className={styles.hr} {...props} />
          ),
          
          // Pre - for code blocks, return children directly to avoid double-wrapping
          pre: ({ node, children, ...props }) => {
            // CodeBlock handles its own pre/code wrapper
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Abbreviations Legend */}
      {abbreviations.length > 0 && (
        <div className={styles['abbr-legend']}>
          <h4 className={styles['abbr-legend-title']}>
            Abbreviations
          </h4>
          <dl className={styles['abbr-legend-list']}>
            {abbreviations.map((item, idx) => (
              <div key={idx} className={styles['abbr-legend-item']}>
                <dt className={styles['abbr-legend-term']}>{item.abbr}</dt>
                <dd className={styles['abbr-legend-definition']}>{item.full}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Footnotes Panel */}
      {footnotes.length > 0 && (
        <FootnotesPanel footnotes={footnotes} messageId={messageId} />
      )}

      {/* Streaming indicator */}
      {streaming && (
        <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '8px' }}>
          <div className={styles['streaming-cursor']} />
        </div>
      )}
    </div>
  );
}