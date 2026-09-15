import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const heightClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const hClass = heightClasses[size] || heightClasses.md;

  if (variant === 'icon') {
    return (
      <img
        src="/assets/skillnexa-emblem.png"
        alt="SkillNexa"
        className={`${hClass} w-auto object-contain shrink-0 filter drop-shadow-md ${className}`}
      />
    );
  }

  return (
    <img
      src="/assets/skillnexa-logo.png"
      alt="SkillNexa Logo"
      className={`${hClass} w-auto object-contain shrink-0 filter drop-shadow-lg ${className}`}
    />
  );
};

export default Logo;
