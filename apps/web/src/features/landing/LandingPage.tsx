import { HeroSection } from './components/hero';
import { FeaturesOverview } from './components/features-overview';
import { CtaSection } from './components/cta-section';
import { LandingFooter } from './components/footer';
import { useAuth } from '@jira-clone/shared';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.full_name;

  return (
    <div className={styles.container}>
      <HeroSection isAuthenticated={isAuthenticated} userName={userName} />
      <FeaturesOverview isAuthenticated={isAuthenticated} />
      <CtaSection isAuthenticated={isAuthenticated} userName={userName} />
      <LandingFooter isAuthenticated={isAuthenticated} />
    </div>
  );
}

export default LandingPage;
