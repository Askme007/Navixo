import { ReactNode } from 'react';
import './ShimmerButton.css';

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: any;
}

export function ShimmerButton({ children, className = '', onClick, style }: ShimmerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`shimmer-button ${className}`}
      style={style}
    >
      <span className="shimmer-button-content">{children}</span>
      <span className="shimmer-overlay"></span>
    </button>
  );
}
