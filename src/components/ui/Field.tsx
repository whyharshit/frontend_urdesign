import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { CITIES as CITY_OPTIONS } from '../../config/catalog';
type Shared = { label: string; hint?: string; error?: string };
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Labels phrased as questions or instructions need their own wording, not "Enter <label>". */
const REQUIRED_MESSAGES: Record<string, string> = {
  'Give your project a name': 'Give your project a name',
  'What would you like to create?': 'Describe what you’d like to create',
  'Based in': 'Enter the city you’re based in',
  'About the project': 'Tell us about the project',
  'About your practice': 'Tell clients about your practice',
  'A little about this service': 'Describe this service',
  'Your approach & scope': 'Describe your approach and scope',
  'Service required': 'Choose the service you need',
  'How would you like to show pricing?': 'Choose how to show pricing',
  'Indicative design fee (₹)': 'Enter your indicative design fee',
  'Studio / firm name': 'Enter your studio or firm name',
  'Your name': 'Enter your name',
  'Full name': 'Enter your full name',
  'Project city': 'Enter the project city',
  'Add a city': 'Enter a city',
  'Reason for this action': 'Give a reason for this action',
  'Rejection reason': 'Give a reason for rejecting',
  'What’s the problem?': 'Choose a reason',
};

/** "Enter …" / "Choose …" for noun labels; a neutral prompt for anything else. */
export function requiredMessage(label: string, select = false) {
  const clean = label.replace(/\s*\(optional\)\s*$/i, '').trim();
  if (REQUIRED_MESSAGES[clean]) return REQUIRED_MESSAGES[clean];
  if (/\?$/.test(clean)) return select ? 'Choose an option' : 'Fill in this field';
  const name = clean.replace(/\s*\([^)]*\)/g, '').toLowerCase();
  return select ? `Choose ${name}` : `Enter ${name}`;
}

/** People's names: letters (any script), spaces, apostrophes, dots and hyphens. */
export const NAME_PATTERN = String.raw`[\p{L}\p{M}][\p{L}\p{M} .'’\-]*`;
export const NAME_TITLE = 'Use letters only. Spaces, apostrophes, dots and hyphens are fine.';

/** Requires a dot-separated domain, so "a@b" is refused (the browser's own check allows it). */
export const EMAIL_PATTERN = '[^@\\s]+@[^@\\s]+\\.[A-Za-z]{2,}';

/** Plain-language reason a field failed, shown in red under it. */
export function validationMessage(control: Control, label: string) {
  const v = control.validity;
  const name = label.replace(/\s*\(optional\)\s*$/i, '').toLowerCase();
  if (v.customError) return control.validationMessage;
  if (control.type === 'tel' && (v.valueMissing || v.patternMismatch || v.tooShort))
    return 'Enter a 10-digit mobile number';
  if (control.type === 'email' && (v.valueMissing || v.typeMismatch || v.patternMismatch))
    return 'Enter a valid email, e.g. name@example.com';
  if (control.type === 'password' && (v.valueMissing || v.tooShort))
    return 'Password needs 8+ characters';
  if (control.type === 'checkbox' && v.valueMissing) return 'Tick this box to continue';
  if (v.valueMissing) return requiredMessage(label, control instanceof HTMLSelectElement);
  if (v.tooShort && 'minLength' in control) return `Write at least ${control.minLength} characters`;
  if (v.rangeUnderflow && 'min' in control) return `Enter ${control.min} or more`;
  if (v.rangeOverflow && 'max' in control) return `Enter ${control.max} or less`;
  if (v.typeMismatch && control.type === 'url') return 'Enter a full link, e.g. https://…';
  if (v.patternMismatch) return control.title || `Check the ${name}`;
  return control.validationMessage;
}

/**
 * Browsers skip `minLength` on text that was not typed (restored drafts) and accept spaces for
 * `required`. Enforce both, then show the first problem as a message instead of a bare outline.
 */
function useValidation(
  label: string,
  value: unknown,
  minLength: number | undefined,
  required: boolean | undefined,
  external?: string,
) {
  const ref = useRef<Control>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const control = ref.current;
    if (!control || typeof value !== 'string') return;
    const length = value.trim().length;
    control.setCustomValidity(
      required && value.length > 0 && length === 0
        ? requiredMessage(label)
        : minLength && length > 0 && length < minLength
          ? `Write at least ${minLength} characters (${length} so far)`
          : '',
    );
    if (message && control.validity.valid) setMessage('');
  }, [value, minLength, required, label, message]);
  return {
    ref,
    error: external || message,
    onInvalid: (event: React.FormEvent<Control>) => {
      event.preventDefault();
      setMessage(validationMessage(event.currentTarget, label));
      const form = event.currentTarget.form;
      // Bring the first invalid field into view, as the native bubble would have.
      if (form && form.querySelector(':invalid') === event.currentTarget)
        event.currentTarget.focus();
    },
    clear: () => {
      if (message && ref.current?.validity.valid) setMessage('');
    },
  };
}

function Help({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {error && (
        <small id={`${id}-error`} className="error-text" role="alert">
          {error}
        </small>
      )}
      {hint && <small id={`${id}-help`}>{hint}</small>}
    </>
  );
}
const describedBy = (id: string, hint?: string, error?: string) =>
  [error && `${id}-error`, hint && `${id}-help`].filter(Boolean).join(' ') || undefined;

export function Input({
  label,
  hint,
  error: externalError,
  id: givenId,
  onChange,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & Shared) {
  const autoId = useId();
  const id = givenId || autoId;
  const { ref, error, onInvalid, clear } = useValidation(
    label,
    props.value,
    props.minLength,
    props.required,
    externalError,
  );
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        ref={ref as React.Ref<HTMLInputElement>}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, hint, error)}
        onInvalid={onInvalid}
        onChange={(e) => {
          onChange?.(e);
          clear();
        }}
        pattern={props.type === 'email' ? EMAIL_PATTERN : undefined}
        {...props}
      />
      <Help id={id} hint={hint} error={error} />
    </div>
  );
}
export function Select({
  label,
  hint,
  error: externalError,
  children,
  id: givenId,
  onChange,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & Shared & { children: ReactNode }) {
  const autoId = useId();
  const id = givenId || autoId;
  const { ref, error, onInvalid, clear } = useValidation(
    label,
    undefined,
    undefined,
    props.required,
    externalError,
  );
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        ref={ref as React.Ref<HTMLSelectElement>}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, hint, error)}
        onInvalid={onInvalid}
        onChange={(e) => {
          onChange?.(e);
          clear();
        }}
        {...props}
      >
        {children}
      </select>
      <Help id={id} hint={hint} error={error} />
    </div>
  );
}
export function Textarea({
  label,
  hint,
  error: externalError,
  id: givenId,
  onChange,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & Shared) {
  const autoId = useId();
  const id = givenId || autoId;
  const { ref, error, onInvalid, clear } = useValidation(
    label,
    props.value,
    props.minLength,
    props.required,
    externalError,
  );
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label htmlFor={id}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={id}
        ref={ref as React.Ref<HTMLTextAreaElement>}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, hint, error)}
        onInvalid={onInvalid}
        onChange={(e) => {
          onChange?.(e);
          clear();
        }}
        {...props}
      />
      <Help id={id} hint={hint} error={error} />
    </div>
  );
}

/** Required consent checkbox with the same red message as other fields. */
export function Checkbox({
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  const [error, setError] = useState('');
  return (
    <div className="field">
      <label className="checkbox">
        <input
          type="checkbox"
          {...props}
          onInvalid={(e) => {
            e.preventDefault();
            setError('Tick this box to continue');
          }}
          onChange={(e) => {
            props.onChange?.(e);
            if (e.target.checked) setError('');
          }}
        />
        <span>{children}</span>
      </label>
      {error && (
        <small className="error-text" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

/** Searchable city input backed by the full city list. Any typed city is accepted. */
export function CityInput({
  label,
  value,
  onChange,
  required,
  hint,
  id,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  id?: string;
}) {
  const listId = useId();
  return (
    <>
      <Input
        id={id}
        label={label}
        value={value}
        list={listId}
        required={required}
        autoComplete="address-level2"
        placeholder="Start typing a city"
        hint={hint}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          const typed = e.target.value.trim().toLowerCase();
          const match = CITY_OPTIONS.find((c) => c.toLowerCase() === typed);
          if (match && match !== e.target.value) onChange(match);
        }}
      />
      <datalist id={listId}>
        {CITY_OPTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}
