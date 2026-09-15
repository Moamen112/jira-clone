import { useState } from 'react';
import type { CSSProperties, FC, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Input, Button, Text } from '../../../../components/base';
import { ROUTES } from '../../../../routes/paths';
import styles from './SignUpForm.module.css';

// ============================================================================
// ICONS — inline, theme-aware (inherit currentColor from the input)
// ============================================================================

interface IconProps {
  size?: number;
}

const PersonIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="7" r="4" />
    <path d="M6 11 L18 11 L18 15 L15 20 L9 20 L6 15 Z" />
  </svg>
);

const MailIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="4" width="16" height="11" rx="2" />
    <polyline points="5 15 12 21 19 15" />
  </svg>
);

const KeyIcon: FC<IconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="7" r="4" />
    <line x1="12" y1="11" x2="12" y2="20" />
    <polyline points="12 16 16 16 16 20" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

export interface SignUpFormValues {
  /** Trimmed full name */
  name: string;
  /** Trimmed email address */
  email: string;
  /** Raw password */
  password: string;
}

export interface SignUpFormProps {
  /** Prefilled full name */
  initialName?: string;
  /** Prefilled email value */
  initialEmail?: string;
  /** Prefilled password value */
  initialPassword?: string;
  /** Submit handler — replaces the default mock navigation once the API lands */
  onSubmit?: (values: SignUpFormValues) => void | Promise<void>;
  /** Submit button label */
  submitLabel?: string;
  /** Loading state (disables fields and shows a spinner) */
  loading?: boolean;
  /** Form-level error banner (e.g. "Email is already registered") */
  error?: string;
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;
/**
 * SignUpForm — name/email/password sign-up form composed from base primitives.
 *
 * Validates locally (required fields, email format, password length), renders
 * inline field errors, and submits via `onSubmit` when provided. Until the
 * backend auth API is wired up, it defaults to the mock behavior of navigating
 * to the protected home dashboard.
 */
export const SignUpForm: FC<SignUpFormProps> = ({
  initialName = '',
  initialEmail = '',
  initialPassword = '',
  onSubmit,
  submitLabel = 'Create Account',
  loading = false,
  error,
  style,
  className = '',
  testID,
}) => {
  const navigate = useNavigate();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

  // TODO(backend): remove the default mock navigation and drive submission
  // through `onSubmit` calling the real auth API once it is wired up.
  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextNameError = trimmedName === '' ? 'Full name is required.' : undefined;
    const nextEmailError = !trimmedEmail
      ? 'Email address is required.'
      : !EMAIL_PATTERN.test(trimmedEmail)
        ? 'Enter a valid email address.'
        : undefined;
    const nextPasswordError =
      password === ''
        ? 'Password is required.'
        : password.length < PASSWORD_MIN_LENGTH
          ? `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`
          : undefined;

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextNameError || nextEmailError || nextPasswordError) {
      return;
    }

    if (onSubmit) {
      void onSubmit({ name: trimmedName, email: trimmedEmail, password });
      return;
    }

    navigate(ROUTES.PROTECTED.HOME);
  };

  return (
    <form
      className={`${styles.form} ${className}`}
      style={style}
      data-testid={testID}
      onSubmit={handleSubmit}
      noValidate
    >
      <Input
        label="Full name"
        type="text"
        placeholder="Alex Morgan"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setNameError(undefined);
        }}
        error={nameError}
        leftIcon={<PersonIcon size={16} />}
        autoFocus
        disabled={loading}
        containerStyle={{ marginBottom: 0 }}
      />

      <Input
        label="Email address"
        type="email"
        placeholder="alex@fieldnotes.dev"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailError(undefined);
        }}
        error={emailError}
        leftIcon={<MailIcon size={16} />}
        disabled={loading}
        containerStyle={{ marginBottom: 0 }}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(undefined);
        }}
        error={passwordError}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters`}
        leftIcon={<KeyIcon size={16} />}
        disabled={loading}
        containerStyle={{ marginBottom: 0 }}
      />

      {error && (
        <div className={styles.errorBanner} role="alert">
          <Text variant="errorText" color="var(--color-warn)">
            {error}
          </Text>
        </div>
      )}

      <Button
        label={submitLabel}
        variant="primary"
        size="md"
        fullWidth
        loading={loading}
        disabled={loading}
        onPress={() => handleSubmit()}
      />

      {/* Hidden native submit button — enables Enter-to-submit from the inputs. */}
      <button
        type="submit"
        hidden
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
      >
        Submit
      </button>
    </form>
  );
};

export default SignUpForm;
