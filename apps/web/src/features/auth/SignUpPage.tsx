import { Link } from 'react-router';
import { AuthLayout } from './components/auth-layout';
import { SignUpForm } from './components/sign-up-form';
import { ROUTES } from '../../routes/paths';

export function SignUpPage() {
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
      <SignUpForm />
    </AuthLayout>
  );
}

export default SignUpPage;
