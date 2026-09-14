import { Link, useNavigate } from 'react-router';
import styles from './SignUpPage.module.css';
import { ROUTES } from '../../routes/paths';

export function SignUpPage() {
  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
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
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Get started with your free Jira Clone workspace</p>

        <form className={styles.form} onSubmit={handleSignUp}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alex Morgan"
              defaultValue="Alex Morgan"
              className={styles.input}
            />
          </div>

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
            Create Account
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?{' '}
          <Link to={ROUTES.AUTH.SIGN_IN} className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
