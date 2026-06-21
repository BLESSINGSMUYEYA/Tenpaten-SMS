import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  variant?: 'horizontal' | 'stacked' | 'icon';
  theme?: 'light' | 'dark' | 'auto';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  height = '32px',
  width = 'auto',
  variant = 'horizontal',
}) => {
  let src = '/logo-horizontal.png';
  
  if (variant === 'stacked') {
    src = '/logo-stacked.png';
  } else if (variant === 'icon') {
    src = '/logo-icon.png';
  }

  return (
    <img
      src={src}
      alt="MyKlasi Logo"
      className={`object-contain inline-block select-none ${className}`}
      style={{
        height,
        width,
      }}
      draggable={false}
    />
  );
};
