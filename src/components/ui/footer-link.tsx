import { ReactNode } from 'react';

interface FooterLinkProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
}

export function FooterLink({ children, onClick, href, variant = 'primary' }: FooterLinkProps) {
  const baseStyles = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    fontSize: '14px',
  };

  const variantStyles = {
    primary: {
      color: '#D5D9E2',
      hoverColor: '#14F4C9',
    },
    secondary: {
      color: '#9CA3AF',
      hoverColor: '#E5E7EB',
    },
  };

  const currentVariant = variantStyles[variant];

  const handleClick = (e: React.MouseEvent) => {
    if (href) {
      // For external links, open in new tab
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={baseStyles}
      className={`
        text-left
        cursor-pointer
        relative
        inline-block
        transition-all
        duration-200
        group/link
        ${variant === 'primary' ? 'hover:text-[#14F4C9]' : 'hover:text-gray-200'}
      `}
    >
      <span className="relative">
        {children}
        {/* Animated underline on hover */}
        <span 
          className={`
            absolute 
            left-0 
            bottom-0 
            h-px 
            w-0 
            group-hover/link:w-full 
            transition-all 
            duration-200
            ${variant === 'primary' ? 'bg-[#14F4C9]' : 'bg-gray-300'}
          `}
        />
      </span>
    </button>
  );
}