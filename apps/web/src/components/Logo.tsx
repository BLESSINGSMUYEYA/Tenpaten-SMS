import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  theme?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  height = '32px',
  width = 'auto',
  theme = 'auto',
}) => {
  // theme = 'light': navy text + gold dot/sms
  // theme = 'dark': white/light text + gold dot/sms
  // theme = 'auto': uses dark:fill-white and fill-primary-fixed-dim/primary to adapt automatically!
  const textFill =
    theme === 'light'
      ? 'fill-primary'
      : theme === 'dark'
      ? 'fill-white'
      : 'fill-primary dark:fill-white';

  return (
    <div className={`flex items-center select-none ${className}`} style={{ height, width }}>
      <svg
        viewBox="0 0 170 54"
        className="h-full w-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main "tenpaten" text */}
        <text
          x="0"
          y="35"
          className={`${textFill} font-sans`}
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}
        >
          tenpaten
        </text>

        {/* Golden/Amber dot "." */}
        <circle cx="156" cy="31" r="6.5" fill="#c28b1e" />

        {/* "sms" text below */}
        <text
          x="0"
          y="49"
          fill="#c28b1e"
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          sms
        </text>
      </svg>
    </div>
  );
};
