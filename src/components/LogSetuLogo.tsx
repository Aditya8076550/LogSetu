import React from 'react';

interface LogSetuLogoProps {
  variant?: 'full' | 'mark' | 'compact';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LogSetuLogo: React.FC<LogSetuLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const shieldIcon = (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${iconSizes[size]}`}>
      <svg
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Shield Outer Outline */}
        <path
          d="M50 4L88 18V56C88 82 72 102 50 110C28 102 12 82 12 56V18L50 4Z"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#6657E8] dark:text-[#7868FF]"
        />

        {/* Bridge Suspension Towers */}
        {/* Left Tower */}
        <path
          d="M32 28V62M28 36H36M28 50H36"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-[#6657E8] dark:text-[#7868FF]"
        />
        {/* Right Tower */}
        <path
          d="M68 28V62M64 36H72M64 50H72"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-[#6657E8] dark:text-[#7868FF]"
        />

        {/* Suspension Cable */}
        <path
          d="M16 46C26 36 34 32 44 48C50 56 50 56 56 48C66 32 74 36 84 46"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#35C7F4] dark:text-[#35C7F4]"
        />

        {/* Bridge Deck / Roadway */}
        <path
          d="M16 62H84"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="text-[#6657E8] dark:text-[#7868FF]"
        />

        {/* Center Keyhole in Bridge */}
        <circle
          cx="50"
          cy="48"
          r="4.5"
          fill="currentColor"
          className="text-white dark:text-[#080714]"
        />
        <path
          d="M48 51L46 59H54L52 51Z"
          fill="currentColor"
          className="text-white dark:text-[#080714]"
        />

        {/* Flowing Water / Data Stream Waves below Bridge */}
        <path
          d="M26 73C33 71 42 75 49 73"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="text-[#35C7F4]"
        />
        <path
          d="M22 83C30 81 40 85 50 82"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="text-[#35C7F4]"
        />
        <path
          d="M28 92C34 90 41 93 48 91"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="text-[#35C7F4]"
        />
        <path
          d="M58 72C64 74 72 73 78 70"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="text-[#6657E8] dark:text-[#7868FF]"
        />
        <path
          d="M56 82C62 84 70 83 76 80"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="text-[#6657E8] dark:text-[#7868FF]"
        />
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return <div className={className}>{shieldIcon}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {shieldIcon}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-[#F5F5FF] leading-none">
            LogSetu
          </span>
        </div>
        {variant === 'full' && (
          <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-widest text-[#6657E8] dark:text-[#7868FF] uppercase mt-0.5 leading-none">
            SECURE DATA BRIDGING
          </span>
        )}
      </div>
    </div>
  );
};
