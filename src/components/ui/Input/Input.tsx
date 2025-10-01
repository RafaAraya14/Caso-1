import React from 'react';

import { CardBase } from '../base';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  error?: string;
  label?: string;
  helperText?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-5 text-lg',
};

const getCardVariant = (variant: string) => {
  if (variant === 'outlined') {
    return 'outlined';
  }
  if (variant === 'filled') {
    return 'filled';
  }
  return 'default';
};

const getInputClassName = (size: string) => {
  return `
    w-full bg-transparent border-none outline-none
    text-slate-100 placeholder-slate-400
    ${sizeClasses[size as keyof typeof sizeClasses]}
    disabled:cursor-not-allowed disabled:opacity-50
  `;
};

const getBorderClassName = (error?: string, className?: string) => {
  const errorClass = error
    ? 'border-red-500/50 focus-within:border-red-500'
    : 'focus-within:border-blue-500/50';
  return `input-card ${errorClass} ${className || ''}`;
};

const renderLabel = (id?: string, label?: string, required?: boolean, error?: string) => {
  if (!label) {
    return null;
  }

  return (
    <label
      htmlFor={id}
      className={`block text-sm font-medium ${
        error ? 'text-red-400' : 'text-slate-300'
      } ${required ? "after:content-['*'] after:text-red-400 after:ml-1" : ''}`}
    >
      {label}
    </label>
  );
};

const renderHelperText = (helperText?: string, error?: string) => {
  if (!helperText && !error) {
    return null;
  }

  return (
    <p className={`text-xs ${error ? 'text-red-400' : 'text-slate-500'}`}>{error || helperText}</p>
  );
};

const InputWrapper: React.FC<{
  children: React.ReactNode;
  variant: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  error?: string;
  className?: string;
}> = ({ children, variant, size, error, className }) => {
  return (
    <CardBase
      variant={getCardVariant(variant) as 'default' | 'outlined' | 'filled'}
      size={size}
      className={getBorderClassName(error, className)}
    >
      <div className="p-0">{children}</div>
    </CardBase>
  );
};

const renderInputField = (props: InputProps) => {
  const {
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    required = false,
    id,
    name,
    autoComplete,
    size = 'md',
  } = props;

  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      autoComplete={autoComplete}
      className={getInputClassName(size)}
    />
  );
};

/**
 * Input Component siguiendo Card Design Pattern
 * Usa CardBase como foundation para consistency visual
 */
export const Input: React.FC<InputProps> = props => {
  const {
    variant = 'default',
    size = 'md',
    className = '',
    id,
    label,
    required = false,
    error,
    helperText,
  } = props;

  return (
    <div className="space-y-2">
      {renderLabel(id, label, required, error)}
      <InputWrapper variant={variant} size={size} error={error} className={className}>
        {renderInputField(props)}
      </InputWrapper>
      {renderHelperText(helperText, error)}
    </div>
  );
};
