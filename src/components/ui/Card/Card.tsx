import React from 'react';

import { CardBase } from '../base/CardBase';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  focus?: boolean;
}

const getPaddingClass = (padding: string) => {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'p-4';
    case 'lg':
      return 'p-8';
    default:
      return 'p-6';
  }
};

/**
 * Card Component siguiendo Card Design Pattern
 * Wrapper conveniente alrededor de CardBase con configuración estándar
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  padding = 'md',
  hover = false,
  focus = false,
}) => {
  const paddingClass = getPaddingClass(padding);

  return (
    <CardBase variant={variant} size={size} className={className} hover={hover} focus={focus}>
      <div className={paddingClass}>{children}</div>
    </CardBase>
  );
};
