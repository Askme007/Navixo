/**
 * CodeBlock Component
 * Production-ready code block with copy functionality and syntax highlighting
 */

import React, { useState, useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import { highlightCode } from './utils/syntaxHighlight';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  onCopy?: (text: string) => void;
}

export function CodeBlock({ code, language, onCopy }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlightedCode = useMemo(() => {
    return highlightCode(code, language || '');
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.(code);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={styles['code-block']}>
      <div className={styles['code-header']}>
        {language && (
          <span className={styles['code-language']}>
            {language}
          </span>
        )}
        <button
          onClick={handleCopy}
          className={`${styles['copy-button']} ${copied ? styles.copied : ''}`}
          aria-label={copied ? 'Copied!' : 'Copy code'}
          type="button"
        >
          {copied ? (
            <>
              <Check className={styles['copy-icon']} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className={styles['copy-icon']} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className={styles['code-content']}>
        <pre className={styles['code-pre']}>
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
}