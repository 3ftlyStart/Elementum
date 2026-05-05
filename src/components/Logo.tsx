import React from 'react';
import { FlaskConical } from 'lucide-react';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconOnly?: boolean;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 'md', 
  iconOnly = false,
  showText = true,
  ...props
}) => {
  const sizeMap = {
    sm: { icon: 14, container: 'w-7 h-7', text: 'text-sm' },
    md: { icon: 20, container: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 32, container: 'w-16 h-16', text: 'text-3xl' },
    xl: { icon: 48, container: 'w-24 h-24', text: 'text-5xl' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 group ${className}`} {...props}>
      <div className={`${currentSize.container} relative flex items-center justify-center transition-all duration-500 group-hover:scale-110 rounded-full bg-brand-navy shadow-lg shadow-brand-navy/20`}>
        <FlaskConical 
          size={currentSize.icon} 
          className="text-brand-mint" 
          strokeWidth={2.5}
        />
      </div>
      
      {!iconOnly && showText && (
        <div className="flex flex-col select-none">
          <span className={`font-bold tracking-tighter text-brand-navy dark:text-white ${currentSize.text}`}>
            Met<span className="text-brand-mint">Lyft</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-navy/40 dark:text-brand-mint/40 leading-none">
              Lab Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
