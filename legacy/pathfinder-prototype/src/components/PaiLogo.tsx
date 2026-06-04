interface PaiLogoProps {
  className?: string;
  size?: number;
  style?: any;
}

export function PaiLogo({ className = "w-6 h-6", size, style }: PaiLogoProps) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        ...style,
        filter: 'drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.2))'
      }}
    >
      <path 
        d="M7 4h14v2h-4v12h-2V6H9v12H7V6H4V4h3z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}