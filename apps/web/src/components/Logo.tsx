import React from 'react';
import logoHorizontal from '../assets/logo-horizontal.png';
import logoStacked from '../assets/logo-stacked.png';
import logoIcon from '../assets/logo-icon.png';

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
  let src = logoHorizontal;
  
  if (variant === 'stacked') {
    src = logoStacked;
  } else if (variant === 'icon') {
    src = logoIcon;
  }

  // Scale the logo size up further (by 50%) as requested
  let finalHeight = height;
  if (typeof height === 'string' && height.endsWith('px')) {
    const val = parseFloat(height);
    if (!isNaN(val)) {
      finalHeight = `${val * 1.5}px`;
    }
  } else if (typeof height === 'number') {
    finalHeight = height * 1.5;
  }

  return (
    <img
      src={src}
      alt="MyKlasi Logo"
      className={`object-contain inline-block select-none ${className}`}
      style={{
        height: finalHeight,
        width,
      }}
      draggable={false}
    />
  );
};
