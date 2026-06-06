import PublicLayout from '../components/shared/PublicLayout';
import Hero from '../components/Hero';
import SmartSearch from '../components/SmartSearch';
import FeaturedMarketplaceProducts from '../components/FeaturedMarketplaceProducts';
import IndustryFocus from '../components/IndustryFocus';
import HowItWorks from '../components/HowItWorks';
import MarketTransformation from '../components/MarketTransformation';
import DataAnalytics from '../components/DataAnalytics';
import GearUpTradeAdvisor from '../components/GearUpTradeAdvisor';
import TrustCredibility from '../components/TrustCredibility';
import CallToAction from '../components/CallToAction';

export default function Homepage() {
  return (
    <PublicLayout>
      <Hero />
      <SmartSearch />
      <FeaturedMarketplaceProducts />
      <IndustryFocus />
      <HowItWorks />
      <MarketTransformation />
      <DataAnalytics />
      <GearUpTradeAdvisor />
      <TrustCredibility />
      <CallToAction />
    </PublicLayout>
  );
}
