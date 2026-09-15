import { HeroSection } from './components/hero';
import { FeaturesOverview } from './components/features-overview';
import { CtaSection } from './components/cta-section';
import { LandingFooter } from './components/footer';
import { mockCurrentUser } from '@jira-clone/shared';
import styles from './LandingPage.module.css';

export function LandingPage() {
  // TODO(backend): replace the mocked session with the real authenticated user
  // returned by the backend once the auth API is wired up.
  const currentUser = mockCurrentUser;
  const isAuthenticated = Boolean(currentUser);

  return (
    <div className={styles.container}>
      <HeroSection isAuthenticated={isAuthenticated} userName={currentUser?.name} />
      <FeaturesOverview isAuthenticated={isAuthenticated} />
      <CtaSection isAuthenticated={isAuthenticated} userName={currentUser?.name} />
      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default LandingPage;
