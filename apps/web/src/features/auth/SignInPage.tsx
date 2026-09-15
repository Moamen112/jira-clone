import { Link } from 'react-router';
import { AuthLayout } from './components/auth-layout';
import { SignInForm } from './components/sign-in-form';
import { ROUTES } from '../../routes/paths';

export function SignInPage() {
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
      <SignInForm />
    </AuthLayout>
  );
}

export default SignInPage;
