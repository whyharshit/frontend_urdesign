import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
type Shared = { label: string; hint?: string; error?: string };
export function Input({
  label,
  hint,
  error,
  id: givenId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & Shared) {
  const autoId = useId();
  const id = givenId || autoId;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${id}-help` : undefined}
        {...props}
      />
      {(hint || error) && (
        <small id={`${id}-help`} className={error ? 'error-text' : ''}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
export function Select({
  label,
  hint,
  error,
  children,
  id: givenId,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & Shared & { children: ReactNode }) {
  const autoId = useId();
  const id = givenId || autoId;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${id}-help` : undefined}
        {...props}
      >
        {children}
      </select>
      {(hint || error) && (
        <small id={`${id}-help`} className={error ? 'error-text' : ''}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
export function Textarea({
  label,
  hint,
  error,
  id: givenId,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & Shared) {
  const autoId = useId();
  const id = givenId || autoId;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${id}-help` : undefined}
        {...props}
      />
      {(hint || error) && (
        <small id={`${id}-help`} className={error ? 'error-text' : ''}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
