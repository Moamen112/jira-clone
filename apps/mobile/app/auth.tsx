import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@jira-clone/shared';
import { Text, Button, Input } from '../src/components/base';
import { useTheme, spacing, radius } from '../src/tokens';

type AuthMode = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
}

export default function AuthScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const {
    is2FARequired,
    is2FASetupRequired,
    totpSetupData,
    signIn,
    signUp,
    verify2FA,
    cancel2FA,
    isLoading,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
    clearError();
  };

  const handleCredentialsSubmit = async () => {
    const nextErrors: FieldErrors = {};

    if (mode === 'register' && !name.trim()) {
      nextErrors.name = 'Full name is required.';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      nextErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    clearError();

    try {
      if (mode === 'register') {
        // Sign up automatically triggers sign in and sets up mandatory 2FA
        await signUp({
          full_name: name.trim(),
          email: trimmedEmail,
          password,
        });
      } else {
        await signIn({
          email: trimmedEmail,
          password,
        });
      }
    } catch {
      // Backend error is presented by useAuth.error
    }
  };

  const handleVerify2FA = async () => {
    const trimmedCode = totpCode.trim();
    if (!trimmedCode) {
      setErrors({ code: 'Please enter the 6-digit code.' });
      return;
    }
    if (!/^\d{6}$/.test(trimmedCode)) {
      setErrors({ code: 'Code must be exactly 6 digits.' });
      return;
    }

    setErrors({});
    clearError();

    try {
      await verify2FA(trimmedCode);
      router.replace('/(tabs)');
    } catch {
      // Backend error is presented by useAuth.error
    }
  };

  const isRegister = mode === 'register';

  const qrImageUrl = totpSetupData?.otpauthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        totpSetupData.otpauthUri
      )}`
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: colors.paper }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.logoMark, { backgroundColor: colors.accent }]}>
          <Text variant="display" bold color="#FFFFFF">
            J
          </Text>
        </View>

        <Text variant="heading" bold style={styles.brand}>
          Jira Clone
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.line },
          ]}
        >
          {/* 2FA Challenge Screen */}
          {is2FARequired ? (
            <View style={styles.formContainer}>
              <Text variant="subheading" bold align="center">
                {is2FASetupRequired
                  ? 'Set up Authenticator'
                  : 'Two-Factor Authentication'}
              </Text>
              <Text variant="caption" muted align="center">
                {is2FASetupRequired
                  ? 'Scan the QR code with Google Authenticator or Authy to complete setup.'
                  : 'Enter the 6-digit code from your authenticator app.'}
              </Text>

              {is2FASetupRequired && qrImageUrl && (
                <View style={styles.qrContainer}>
                  <Image
                    source={{ uri: qrImageUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {is2FASetupRequired && totpSetupData?.secret && (
                <View style={styles.secretBox}>
                  <Text variant="caption" muted align="center">
                    Or enter key manually:
                  </Text>
                  <Text
                    variant="caption"
                    bold
                    align="center"
                    color={colors.accent}
                    style={styles.secretText}
                  >
                    {totpSetupData.secret}
                  </Text>
                </View>
              )}

              <Input
                label="6-Digit Verification Code"
                placeholder="123456"
                value={totpCode}
                onChangeText={(text) => {
                  setTotpCode(text);
                  setErrors({});
                }}
                keyboardType="number-pad"
                maxLength={6}
                error={errors.code}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Text variant="caption" color="var(--color-warn, #E5484D)">
                    {error}
                  </Text>
                </View>
              )}

              <Button
                label={
                  is2FASetupRequired ? 'Verify & Link Device' : 'Verify Code'
                }
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleVerify2FA}
              />

              <Button
                label="Cancel / Back"
                variant="ghost"
                size="md"
                fullWidth
                onPress={() => {
                  cancel2FA();
                  setTotpCode('');
                  setErrors({});
                }}
              />
            </View>
          ) : (
            /* Login / Register Credentials Screen */
            <View style={styles.formContainer}>
              <View style={[styles.tabs, { backgroundColor: colors.paper }]}>
                {(['login', 'register'] as AuthMode[]).map((tab) => {
                  const active = mode === tab;
                  const label = tab === 'login' ? 'Log in' : 'Register';
                  return (
                    <Pressable
                      key={tab}
                      onPress={() => switchMode(tab)}
                      accessibilityRole="tab"
                      accessibilityLabel={label}
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.tab,
                        active
                          ? { backgroundColor: colors.accentSoft }
                          : pressed
                          ? { backgroundColor: colors.line }
                          : undefined,
                      ]}
                    >
                      <Text
                        variant="label"
                        bold
                        color={active ? colors.accent : colors.inkMuted}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {isRegister && (
                <Input
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={errors.name}
                />
              )}

              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry
                error={errors.password}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Text variant="caption" color="var(--color-warn, #E5484D)">
                    {error}
                  </Text>
                </View>
              )}

              <Button
                label={isRegister ? 'Create account' : 'Log in'}
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onPress={handleCredentialsSubmit}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[4],
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: spacing[3],
    marginBottom: spacing[4],
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: radius.sheet,
    borderWidth: 1,
    padding: spacing[4],
  },
  formContainer: {
    gap: spacing[3],
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: radius.input,
    padding: 2,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: radius.input - 2,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: spacing[2],
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  secretBox: {
    padding: spacing[2],
    borderRadius: radius.input,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    gap: 2,
  },
  secretText: {
    letterSpacing: 1.5,
    userSelect: 'all',
  },
  errorBox: {
    padding: spacing[2],
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    borderRadius: radius.input,
  },
});