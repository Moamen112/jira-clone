import { Link, useNavigate } from 'react-router';
import { AuthLayout } from './components/auth-layout';
import { SignInForm } from './components/sign-in-form';
import { TwoFactorForm } from './components/two-factor-form';
import { ROUTES } from '../../routes/paths';
import { useAuth } from '@jira-clone/shared';

export function SignInPage() {
  const navigate = useNavigate();
  const { is2FARequired, is2FASetupRequired, signIn, isLoading, error } = useAuth();

  const handleSignIn = async (values: { email: string; password: string }) => {
    try {
      await signIn(values);
    } catch {
      // Error handled by useAuth state
    }
  };

  if (is2FARequired) {
    return (
      <AuthLayout
        title={is2FASetupRequired ? 'Set up Two-Factor Auth' : 'Two-Factor Authentication'}
        subtitle={
          is2FASetupRequired
            ? 'Mandatory security setup: link your authenticator app to continue'
            : 'Enter the 6-digit code from your authenticator app'
        }
      >
        <TwoFactorForm onSuccess={() => navigate(ROUTES.PROTECTED.HOME)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.AUTH.SIGN_UP}>Sign up</Link>
        </>
      }
    >
      <SignInForm
        onSubmit={handleSignIn}
        loading={isLoading}
        error={error ?? undefined}
      />
    </AuthLayout>
  );
}

export default SignInPage;
