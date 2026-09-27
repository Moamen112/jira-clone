import { Link, useNavigate } from 'react-router';
import { AuthLayout } from './components/auth-layout';
import { SignUpForm } from './components/sign-up-form';
import { TwoFactorForm } from './components/two-factor-form';
import { ROUTES } from '../../routes/paths';
import { useAuth } from '@jira-clone/shared';

export function SignUpPage() {
  const navigate = useNavigate();
  const { is2FARequired, is2FASetupRequired, signUp, isLoading, error } = useAuth();

  const handleSignUp = async (values: { name: string; email: string; password: string }) => {
    try {
      await signUp({
        full_name: values.name,
        email: values.email,
        password: values.password,
      });
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
            ? 'Mandatory security setup: link your authenticator app to complete registration'
            : 'Enter the 6-digit code from your authenticator app'
        }
      >
        <TwoFactorForm onSuccess={() => navigate(ROUTES.PROTECTED.HOME)} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Get started with your free Jira Clone workspace"
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.AUTH.SIGN_IN}>Sign in</Link>
        </>
      }
    >
      <SignUpForm
        onSubmit={handleSignUp}
        loading={isLoading}
        error={error ?? undefined}
      />
    </AuthLayout>
  );
}

export default SignUpPage;
