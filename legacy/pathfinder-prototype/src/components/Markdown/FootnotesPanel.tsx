/**
 * FootnotesPanel Component
 * Collapsible footnotes section at the bottom of messages
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './FootnotesPanel.module.css';

interface FootnotesPanelProps {
  footnotes: Array<{ id: string; text: string }>;
  messageId?: string;
}

export function FootnotesPanel({ footnotes, messageId }: FootnotesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (footnotes.length === 0) return null;

  return (
    <div className={styles['footnotes-panel']}>
      <button
        className={styles['footnotes-toggle']}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        type="button"
      >
        <span className={styles['footnotes-title']}>
          Footnotes ({footnotes.length})
        </span>
        {isExpanded ? (
          <ChevronUp style={{ width: '20px', height: '20px' }} />
        ) : (
          <ChevronDown style={{ width: '20px', height: '20px' }} />
        )}
      </button>

      {isExpanded && (
        <ol className={styles['footnotes-list']}>
          {footnotes.map((footnote) => (
            <li
              key={footnote.id}
              id={`footnote-${messageId}-${footnote.id}`}
              className={styles['footnote-item']}
            >
              <span className={styles['footnote-number']}>
                {footnote.id}
              </span>
              <span className={styles['footnote-text']}>
                {footnote.text}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
