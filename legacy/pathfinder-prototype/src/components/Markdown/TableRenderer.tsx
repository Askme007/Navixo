/**
 * TableRenderer Component
 * Responsive tables with visible borders on dark backgrounds
 */

import React from 'react';
import styles from './TableRenderer.module.css';

interface TableRendererProps {
  children: React.ReactNode;
}

export function TableRenderer({ children, ...props }: TableRendererProps) {
  return (
    <div className={styles['table-wrapper']}>
      <div className={styles['table-scroll']}>
        <table className={styles.table} {...props}>
          {children}
        </table>
      </div>
    </div>
  );
}
