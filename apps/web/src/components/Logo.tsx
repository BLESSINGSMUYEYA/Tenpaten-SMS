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
  // Brand colors:
  // - Green: #0e7a3f (light mode), #4ade80 (dark mode)
  // - Yellow/Gold: #ffd000 (constant for contrast)
  const myTextFill =
    theme === 'light'
      ? 'fill-[#0e7a3f]'
      : theme === 'dark'
      ? 'fill-white'
      : 'fill-[#0e7a3f] dark:fill-white';

  const greenBrandFill =
    theme === 'light'
      ? 'fill-[#0e7a3f]'
      : theme === 'dark'
      ? 'fill-[#4ade80]'
      : 'fill-[#0e7a3f] dark:fill-[#4ade80]';

  const greenBrandStroke =
    theme === 'light'
      ? 'stroke-[#0e7a3f]'
      : theme === 'dark'
      ? 'stroke-[#4ade80]'
      : 'stroke-[#0e7a3f] dark:stroke-[#4ade80]';

  return (
    <div className={`flex items-center select-none ${className}`} style={{ height, width }}>
      <svg
        viewBox="0 0 200 54"
        className="h-full w-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* --- ICON PART --- */}
        <g transform="translate(0, 0)">
          {/* Green circular arc on top/left */}
          <path
            d="M 6 36 A 21 21 0 1 1 40 36 A 19 19 0 1 0 8 36 Z"
            className={`${greenBrandFill}`}
          />
          
          {/* Yellow crescent arc on bottom */}
          <path
            d="M 6 38 A 21 21 0 0 0 40 38 A 19 19 0 0 1 8 38 Z"
            fill="#ffd000"
          />

          {/* Door opening background (yellow) */}
          <rect x="18" y="17" width="12" height="20" fill="#ffd000" />

          {/* Door frame (green) */}
          <path
            d="M 18 37 L 18 17 L 30 17 L 30 37"
            className={`${greenBrandStroke}`}
            strokeWidth="2.2"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Door leaf open to the left (green) */}
          <polygon
            points="18,17 11,15 11,39 18,37"
            className={`${greenBrandFill}`}
          />

          {/* White doorknob */}
          <circle cx="13.5" cy="27" r="0.8" fill="#ffffff" />

          {/* Steps below the door (yellow light rays) */}
          <line x1="13" y1="39" x2="29" y2="39" stroke="#ffd000" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="41" x2="27" y2="41" stroke="#ffd000" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="43" x2="25" y2="43" stroke="#ffd000" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="19" y1="45" x2="23" y2="45" stroke="#ffd000" strokeWidth="1.5" strokeLinecap="round" />

          {/* Classroom interior details (green) */}
          {/* Blackboard */}
          <rect
            x="22" y="20" width="6" height="4"
            className={`${greenBrandStroke}`}
            strokeWidth="0.8"
            fill="none"
          />
          {/* Teacher */}
          <circle cx="20.5" cy="22" r="0.6" className={`${greenBrandFill}`} />
          <path d="M 20.5 22.8 C 20.5 23.5, 19.8 25.5, 19.8 25.5 L 21.2 25.5 Z" className={`${greenBrandFill}`} />
          <line x1="20.8" y1="23.2" x2="22.2" y2="22.2" className={`${greenBrandStroke}`} strokeWidth="0.6" />

          {/* Students */}
          <circle cx="23" cy="28.5" r="0.6" className={`${greenBrandFill}`} />
          <path d="M 22.2 29.3 C 22.2 29.7, 23.8 29.7, 23.8 29.3 Z" className={`${greenBrandFill}`} />
          
          <circle cx="27" cy="28.5" r="0.6" className={`${greenBrandFill}`} />
          <path d="M 26.2 29.3 C 26.2 29.7, 27.8 29.7, 27.8 29.3 Z" className={`${greenBrandFill}`} />
        </g>

        {/* --- TEXT PART --- */}
        <text
          x="48"
          y="38"
          style={{
            fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', sans-serif",
            fontSize: '38px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          <tspan className={`${myTextFill}`}>My</tspan>
          <tspan fill="#ffd000">klasi</tspan>
        </text>
      </svg>
    </div>
  );
};
