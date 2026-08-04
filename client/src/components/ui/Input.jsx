import React, { useState } from 'react';
import './Input.css';

/**
 * Input component with floating label, error state, and icon support.
 */
export default function Input({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  id,
  required,
  disabled,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== '';
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${focused ? 'input-group--focused' : ''} ${disabled ? 'input-group--disabled' : ''} ${className}`}>
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          type={type}
          className={`input-field ${hasValue || focused ? 'input-field--active' : ''} ${icon ? 'input-field--with-icon' : ''}`}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          disabled={disabled}
          required={required}
          {...props}
        />
        {label && (
          <label htmlFor={inputId} className={`input-label ${hasValue || focused ? 'input-label--float' : ''} ${icon ? 'input-label--with-icon' : ''}`}>
            {label}{required && <span className="input-required">*</span>}
          </label>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
