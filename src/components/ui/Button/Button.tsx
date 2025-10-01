import React from 'react';

import { CardBase } from '../base/CardBase';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

const getCardVariant = (variant: string) => {
  if (variant === 'secondary') {
    return 'outlined';
  }
  if (variant === 'ghost') {
    return 'filled';
  }
  return 'default';
};

const getButtonStyles = (variant: string, disabled: boolean) => {
  const baseStyles = 'w-full h-full flex items-center justify-center font-medium transition-colors';

  if (disabled) {
    return `${baseStyles} cursor-not-allowed opacity-50`;
  }

  switch (variant) {
    case 'primary':
      return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white`;
    case 'secondary':
      return `${baseStyles} bg-transparent text-slate-300 hover:text-slate-100`;
    case 'ghost':
      return `${baseStyles} bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30`;
    default:
      return `${baseStyles} bg-blue-600 hover:bg-blue-700 text-white`;
  }
};

const renderLoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * Button Component siguiendo Card Design Pattern
 * Usa CardBase como foundation para consistency visual
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  'data-testid': testId,
}) => {
  const isDisabled = disabled || loading;
  const cardVariant = getCardVariant(variant);
  const buttonStyles = getButtonStyles(variant, isDisabled);

  return (
    <CardBase
      variant={cardVariant as 'default' | 'outlined' | 'filled'}
      size={size}
      className={className}
      hover={!isDisabled}
      focus={!isDisabled}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        data-testid={testId}
        className={buttonStyles}
      >
        {loading ? (
          <>
            {renderLoadingSpinner()}
            Cargando...
          </>
        ) : (
          children
        )}
      </button>
    </CardBase>
  );
};
