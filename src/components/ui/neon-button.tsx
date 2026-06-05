import { ButtonHTMLAttributes, ReactNode } from 'react';

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'pill';
  children: ReactNode;
  fullWidth?: boolean;
}

export function NeonButton({ 
  variant = 'primary', 
  children, 
  fullWidth = false,
  className = '',
  style = {},
  ...props 
}: NeonButtonProps) {
  
  const baseStyles = "relative overflow-hidden transition-all duration-300 group inline-flex items-center justify-center";
  
  // Typography styles for all buttons
  const typographyStyles = {
    fontFamily: 'Space Grotesk, Inter, system-ui, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: '#F9FAFF'
  };
  
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] 
      hover:from-[#2563EB] hover:to-[#7C3AED]
      text-white px-10 py-7 rounded-xl
      border-2 border-[#3B82F6]/50 hover:border-[#3B82F6]/80
      shadow-[0_0_20px_rgba(59,130,246,0.4),0_0_40px_rgba(139,92,246,0.2),inset_0_0_20px_rgba(255,255,255,0.1)]
      hover:shadow-[0_0_30px_rgba(59,130,246,0.6),0_0_60px_rgba(139,92,246,0.3),inset_0_0_30px_rgba(255,255,255,0.15)]
      hover:scale-[1.03]
      backdrop-blur-sm
    `,
    secondary: `
      bg-white/5 hover:bg-white/10
      text-white px-10 py-7 rounded-xl
      border-2 border-white/10 hover:border-[#14F4C9]/50
      shadow-[0_0_15px_rgba(59,130,246,0.2),inset_0_0_20px_rgba(255,255,255,0.05)]
      hover:shadow-[0_0_25px_rgba(20,244,201,0.4),inset_0_0_30px_rgba(255,255,255,0.1)]
      hover:scale-[1.03]
      backdrop-blur-xl
    `,
    pill: `
      bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]
      hover:from-[#2563EB] hover:to-[#7C3AED]
      text-white px-6 py-2 rounded-lg
      border border-[#3B82F6]/50 hover:border-[#3B82F6]/80
      shadow-[0_0_15px_rgba(59,130,246,0.3),inset_0_0_15px_rgba(255,255,255,0.1)]
      hover:shadow-[0_0_25px_rgba(59,130,246,0.5),inset_0_0_20px_rgba(255,255,255,0.15)]
      hover:scale-[1.03]
      backdrop-blur-sm
    `
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{ ...typographyStyles, ...style }}
      {...props}
    >
      {/* Animated border glow effect */}
      <div 
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8), rgba(20, 244, 201, 0.6), rgba(59, 130, 246, 0.8))',
          backgroundSize: '300% 100%',
          animation: 'borderGlow 3s linear infinite',
          filter: 'blur(8px)',
          zIndex: -1
        }}
      />
      
      {/* Shimmer effect for primary */}
      {variant === 'primary' && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            animation: 'shimmer 2s ease-in-out infinite',
            transform: 'translateX(-100%)'
          }}
        />
      )}
      
      {/* Pulse effect */}
      <div 
        className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-[#3B82F6]/20 to-[#8B5CF6]/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
      
      {/* Inner glassmorphism glow */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 to-transparent opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none" />
      
      {/* Content */}
      <span className="relative z-10 group-hover:scale-[1.01] inline-block transition-transform duration-300">
        {children}
      </span>
    </button>
  );
}