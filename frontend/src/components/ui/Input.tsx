import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`field ${error ? 'border-alert focus:ring-alert/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-alert mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-faint mt-1">{hint}</p>}
    </div>
  );
}
