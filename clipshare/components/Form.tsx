import React from 'react';

interface FormInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
}

export function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  hint,
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-700 focus:ring-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormTextareaProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
}

export function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
}: FormTextareaProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 rounded-lg bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-none ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-700 focus:ring-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormSelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FormSelect({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: FormSelectProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-white mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg bg-slate-800 border text-white focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-700 focus:ring-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">Selecciona una opción</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function FormCheckbox({
  label,
  checked,
  onChange,
  error,
}: FormCheckboxProps) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-500 cursor-pointer"
        />
        <span className="text-sm text-white">{label}</span>
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-slate-600',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500 disabled:bg-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-slate-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? '⏳ Cargando...' : children}
    </button>
  );
}

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const colors = {
    success: 'bg-green-900 text-green-100 border-green-700',
    error: 'bg-red-900 text-red-100 border-red-700',
    warning: 'bg-yellow-900 text-yellow-100 border-yellow-700',
    info: 'bg-blue-900 text-blue-100 border-blue-700',
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${colors[type]}`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm font-semibold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
