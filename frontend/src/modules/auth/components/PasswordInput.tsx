import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  /** Seconds before auto-hiding the password again. Default: 2 */
  autoHideDelay?: number;
}

export default function PasswordInput({
  label,
  error,
  autoHideDelay = 2,
  id,
  className = '',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  function show() {
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), autoHideDelay * 1000);
  }

  function hide() {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  function toggle() {
    if (visible) {
      hide();
    } else {
      show();
    }
  }

  // Clear timeout on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={`field pr-10 ${error ? 'border-alert focus:ring-alert/20' : ''} ${className}`}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-alert mt-1">{error}</p>}
    </div>
  );
}
