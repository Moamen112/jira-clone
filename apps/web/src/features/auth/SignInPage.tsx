import { Link, useNavigate } from 'react-router';
import styles from './SignInPage.module.css';
import { ROUTES } from '../../routes/paths';

export function SignInPage() {
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROUTES.PROTECTED.HOME);
  };

  return (
    <div className={styles.container}>
      <Link to={ROUTES.LANDING} className={styles.brandLink}>
        <div className={styles.brandLogo}>J</div>
        <span>Jira Clone</span>
      </Link>

      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Enter your credentials to access your account</p>

        <form className={styles.form} onSubmit={handleSignIn}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="alex@fieldnotes.dev"
              defaultValue="alex@fieldnotes.dev"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              defaultValue="password"
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>

        <div className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.AUTH.SIGN_UP} className={styles.link}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
