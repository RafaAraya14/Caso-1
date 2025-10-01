import React from 'react';

/**
 * CardBase Component - Foundation for all UI components following Card Design Pattern
 *
 * Este componente establece el patrón de diseño card consistency requerido por el Caso #1.
 * Todos los componentes UI deben usar este base o extender de él.
 */

export interface CardBaseProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  focus?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  onHover?: () => void;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

const variantClasses = {
  default: 'card-default bg-slate-900/50 border border-slate-700/50',
  elevated: 'card-elevated bg-slate-900/80 border border-slate-600/30 shadow-lg',
  outlined: 'card-outlined bg-transparent border-2 border-slate-600',
  filled: 'card-filled bg-slate-800 border border-slate-700',
  ghost: 'card-ghost bg-transparent border-none',
};

const sizeClasses = {
  xs: 'min-h-[2rem]',
  sm: 'min-h-[2.5rem]',
  md: 'min-h-[3rem]',
  lg: 'min-h-[3.5rem]',
  xl: 'min-h-[4rem]',
};

const paddingClasses = {
  none: '',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const radiusClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const buildBaseClasses = (props: {
  variant: string;
  size: string;
  padding: string;
  radius: string;
  shadow: string;
}) => [
  'card-base',
  'transition-all duration-200 ease-in-out',
  'backdrop-blur-sm',
  variantClasses[props.variant as keyof typeof variantClasses],
  sizeClasses[props.size as keyof typeof sizeClasses],
  paddingClasses[props.padding as keyof typeof paddingClasses],
  radiusClasses[props.radius as keyof typeof radiusClasses],
  shadowClasses[props.shadow as keyof typeof shadowClasses],
];

const applyInteractiveStates = (props: {
  baseClasses: string[];
  hover: boolean;
  focus: boolean;
  disabled: boolean;
  onClick?: () => void;
}) => {
  const { baseClasses, hover, focus, disabled, onClick } = props;

  if (hover) {
    baseClasses.push('hover:shadow-xl hover:scale-[1.02] hover:border-slate-500/50');
  }

  if (focus) {
    baseClasses.push(
      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
    );
  }

  if (disabled) {
    baseClasses.push('opacity-50 cursor-not-allowed pointer-events-none');
  }

  if (onClick) {
    baseClasses.push('cursor-pointer select-none');
  }

  return baseClasses;
};

const getInteractiveProps = (props: {
  onClick?: () => void;
  onHover?: () => void;
  disabled?: boolean;
  role?: string;
}) => {
  const { onClick, onHover, disabled, role } = props;

  return {
    onClick: disabled ? undefined : onClick,
    onMouseEnter: onHover,
    role,
    tabIndex: onClick && !disabled ? 0 : undefined,
    ...(onClick &&
      !disabled && {
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }),
  };
};

export const CardBase: React.FC<CardBaseProps> = ({
  children,
  variant = 'default',
  size = 'md',
  padding = 'md',
  radius = 'lg',
  shadow = 'md',
  hover = false,
  focus = false,
  disabled = false,
  className = '',
  onClick,
  onHover,
  role,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const baseClasses = buildBaseClasses({ variant, size, padding, radius, shadow });
  const styledClasses = applyInteractiveStates({ baseClasses, hover, focus, disabled, onClick });
  const combinedClasses = [...styledClasses, className].filter(Boolean).join(' ');
  const interactiveProps = getInteractiveProps({ onClick, onHover, disabled, role });

  return (
    <div
      className={combinedClasses}
      aria-label={ariaLabel}
      data-testid={testId}
      {...interactiveProps}
    >
      {children}
    </div>
  );
};

/**
 * CardContent - Para contenido interno con espaciado estándar
 */
export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`card-content space-y-4 ${className}`}>{children}</div>;

/**
 * CardHeader - Para encabezados de card
 */
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}> = ({ children, className = '', actions }) => (
  <div
    className={`card-header flex items-center justify-between pb-4 border-b border-slate-700/50 ${className}`}
  >
    <div className="card-header-content">{children}</div>
    {actions && <div className="card-header-actions">{actions}</div>}
  </div>
);

/**
 * CardFooter - Para pie de card
 */
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`card-footer pt-4 border-t border-slate-700/50 ${className}`}>{children}</div>
);
