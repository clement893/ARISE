import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import BuildingLeaders from '@/components/BuildingLeaders';
import FourDimensions from '@/components/FourDimensions';
import ChooseYourPath from '@/components/ChooseYourPath';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Marquee />
      <BuildingLeaders />
      <FourDimensions />
      <ChooseYourPath />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
