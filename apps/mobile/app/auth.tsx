import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Button, Input } from '../src/components/base';
import { useTheme, spacing, radius } from '../src/tokens';

type AuthMode = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 6;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const validateEmail = (email: string): string | undefined => {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required.';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  return undefined;
};

/**
 * Demo auth screen — Login / Register tabs with client-side validation only.
 * No auth slice or backend: a valid form simply joins the board (tabs) directly.
 */
export default function AuthScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
  };

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};

    if (mode === 'register' && !name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    const emailError = validateEmail(email);
    if (emailError) nextErrors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // No real auth — valid credentials join the app directly.
    router.replace('/(tabs)');
  };

  const isRegister = mode === 'register';

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
        {/* Login / Register Tabs */}
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
            onChangeText={setName}
            error={errors.name}
          />
        )}

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <Button
          label={isRegister ? 'Create account' : 'Log in'}
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit}
        />

        <Text variant="caption" muted align="center" style={styles.hint}>
          Demo auth — any valid form takes you straight to the board.
        </Text>
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
    gap: spacing[2],
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
  hint: {
    marginTop: spacing[1],
  },
});