import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero';
import InfoSection from '../sections/InfoSection';
import CardSection from '../sections/CardSection';
import QuoteSection from '../sections/QuoteSection';

const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <main>
      <Hero />
      <InfoSection />
      <CardSection />
      <QuoteSection />
    </main>
  );
};

export default Home;