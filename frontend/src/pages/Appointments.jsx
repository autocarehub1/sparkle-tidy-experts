import React from 'react';
import Appointment from '../components/Appointment';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Appointments = () => {
  return (
    <div>
      <Header />
      <main>
        <section className="appointment-section">
          <div className="container">
            <div className="section-header text-center mb-5">
              <h2 className="section-title">Schedule Your Cleaning Service</h2>
              <p className="section-subtitle">
                Book your appointment with Sparkle & Tidy Experts in just a few simple steps.
              </p>
            </div>
            <Appointment />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Appointments; 