'use client';

import { createElement, type ReactNode } from 'react';

/**
 * Thin wrappers around @material/web custom elements, each with a native
 * HTML fallback so the admin stays fully usable before the module loads (or
 * if it fails to). Deliberately dumb — no business logic lives here, so
 * swapping the underlying library later only means rewriting this one file.
 * `ready` comes from useMaterialWeb(), scoped per-consumer to the exact
 * elements that page actually renders.
 */

type ButtonVariant = 'filled' | 'outlined' | 'text';

const BUTTON_TAG: Record<ButtonVariant, string> = {
  filled: 'md-filled-button',
  outlined: 'md-outlined-button',
  text: 'md-text-button',
};

const BUTTON_FALLBACK_CLASS: Record<ButtonVariant, string> = {
  filled: 'button button-dark',
  outlined: 'button button-outline border border-[var(--ink)] text-[var(--ink)]',
  text: 'text-sm underline',
};

export function MaterialButton({
  ready,
  variant = 'filled',
  type = 'button',
  disabled,
  onClick,
  children,
  className,
}: {
  ready: boolean;
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (ready) {
    return createElement(
      BUTTON_TAG[variant],
      { type, disabled, onClick, class: className },
      children
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className ?? BUTTON_FALLBACK_CLASS[variant]}>
      {children}
    </button>
  );
}

export function MaterialTextField({
  ready,
  id,
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 3,
  maxLength,
  placeholder,
  required,
}: {
  ready: boolean;
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url';
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
}) {
  if (ready) {
    return createElement('md-outlined-text-field', {
      id,
      label,
      value,
      type: multiline ? 'textarea' : type,
      rows: multiline ? rows : undefined,
      maxLength,
      placeholder,
      required,
      class: 'w-full',
      onInput: (event: Event) => onChange((event.target as HTMLInputElement).value),
    });
  }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

export function MaterialCheckbox({
  ready,
  id,
  checked,
  onChange,
  label,
}: {
  ready: boolean;
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  if (ready) {
    return (
      <label htmlFor={id} className="flex items-center gap-2 text-sm cursor-pointer">
        {createElement('md-checkbox', {
          id,
          checked,
          onInput: (event: Event) => onChange((event.target as HTMLInputElement).checked),
        })}
        {label}
      </label>
    );
  }
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

export interface MaterialSelectOption {
  value: string;
  label: string;
}

export function MaterialSelect({
  ready,
  id,
  label,
  value,
  onChange,
  options,
}: {
  ready: boolean;
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: MaterialSelectOption[];
}) {
  if (ready) {
    return createElement(
      'md-outlined-select',
      {
        id,
        label,
        value,
        class: 'w-full',
        onInput: (event: Event) => onChange((event.target as HTMLSelectElement).value),
      },
      options.map((option) => createElement('md-select-option', { key: option.value, value: option.value, headline: option.label }))
    );
  }
  return (
    <div className={label ? 'field' : undefined}>
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
