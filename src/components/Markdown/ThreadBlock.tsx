/**
 * ThreadBlock Component
 * 
 * Creates Reddit-style vertical thread connectors for nested content
 * Features:
 * - Thicker neon gradient vertical lines (3px)
 * - Cyan → Blue → Violet gradient matching NAVIXO brand
 * - Soft glow effects for premium futuristic look
 * - Rounded curved elbow connectors
 * - Dynamic indentation based on depth
 * - Smooth fade-in animations
 */

import { motion } from 'motion/react';
import { ReactNode } from 'react';

export interface ThreadBlockProps {
  depth?: number;
  children: ReactNode;
  isLastChild?: boolean;
}

export function ThreadBlock({ depth = 0, children, isLastChild = false }: ThreadBlockProps) {
  // Only show thread UI for depth > 0 (nested items)
  if (depth === 0) {
    return <div className="mb-1">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative pl-6 mb-1"
      style={{ 
        marginLeft: `${depth * 16}px`,
      }}
    >
      {/* Neon Vertical Line with Gradient & Glow */}
      <div
        className="absolute left-0 top-0 w-[3px] rounded-full transition-all"
        style={{
          height: isLastChild ? '16px' : '100%',
          background: 'linear-gradient(to bottom, #00E5FF, #3B82F6, #8B5CF6)',
          boxShadow: '0 0 6px rgba(59, 130, 246, 0.6), 0 0 12px rgba(139, 92, 246, 0.4)',
          filter: 'drop-shadow(0 0 4px #3B82F6)',
        }}
      />

      {/* Neon Curved Elbow Connector with Glow */}
      <div
        className="absolute left-0 top-3 w-4 h-4 border-t-[3px] border-l-[3px] rounded-tl-xl transition-all"
        style={{
          borderColor: '#3B82F6',
          boxShadow: '0 0 6px rgba(59, 130, 246, 0.6), inset 0 0 4px rgba(59, 130, 246, 0.5)',
          filter: 'drop-shadow(0 0 3px #3B82F6)',
        }}
      />

      {/* Content */}
      <div className="pl-4">{children}</div>
    </motion.div>
  );
}