import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Input, Button, Text } from '../../../../components/base';
import { useAuth } from '@jira-clone/shared';
import styles from './TwoFactorForm.module.css';

export interface TwoFactorFormProps {
  onSuccess?: () => void;
}

export const TwoFactorForm: FC<TwoFactorFormProps> = ({ onSuccess }) => {
  const {
    is2FASetupRequired,
    totpSetupData,
    verify2FA,
    cancel2FA,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | undefined>(undefined);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setLocalError('Please enter the 6-digit code.');
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setLocalError('Code must be exactly 6 digits.');
      return;
    }

    setLocalError(undefined);
    clearError();

    try {
      await verify2FA(trimmedCode);
      onSuccess?.();
    } catch {
      // Error is stored in useAuth state
    }
  };

  const qrImageUrl = totpSetupData?.otpauthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        totpSetupData.otpauthUri
      )}`
    : null;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {is2FASetupRequired && (
        <div className={styles.setupBox}>
          <Text variant="subheading" bold align="center">
            Link Authenticator App
          </Text>
          <Text variant="caption" muted align="center">
            Scan the QR code with Google Authenticator, 1Password, or Authy.
          </Text>

          {qrImageUrl && (
            <div className={styles.qrContainer}>
              <img
                src={qrImageUrl}
                alt="Authenticator QR Code"
                className={styles.qrImage}
              />
            </div>
          )}

          {totpSetupData?.secret && (
            <div className={styles.secretContainer}>
              <Text variant="caption" muted>
                Or enter this secret key manually:
              </Text>
              <code className={styles.secretKey}>{totpSetupData.secret}</code>
            </div>
          )}
        </div>
      )}

      <Input
        label="6-Digit Verification Code"
        type="text"
        placeholder="123456"
        value={code}
        onChangeText={(text) => {
          setCode(text);
          setLocalError(undefined);
        }}
        maxLength={6}
        error={localError}
        autoFocus
        disabled={isLoading}
        containerStyle={{ marginBottom: 0 }}
      />

      {(error || localError) && (
        <div className={styles.errorBanner} role="alert">
          <Text variant="errorText" color="var(--color-warn)">
            {localError || error}
          </Text>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          label={is2FASetupRequired ? 'Verify & Link Device' : 'Verify Code'}
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          onPress={() => handleSubmit()}
        />

        <Button
          label="Cancel / Back to Sign In"
          variant="secondary"
          size="md"
          fullWidth
          disabled={isLoading}
          onPress={cancel2FA}
        />
      </div>

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

export default TwoFactorForm;
