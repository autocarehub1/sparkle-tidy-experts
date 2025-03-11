import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import EstimateCalculator from '../components/EstimateCalculator';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="home-page">
      <Header />
      <HeroSection 
        title="Sparkle & Tidy Experts" 
        subtitle="Professional Cleaning Services in San Antonio, Texas"
        ctaText="Get Free Estimate"
        ctaLink="#estimate-calculator"
      />
      <Services />
      <Testimonials />
      <EstimateCalculator id="estimate-calculator" />
      
      <Footer />
    </div>
  );
}

export default Home; 