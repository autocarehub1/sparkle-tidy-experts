import React, { useState } from 'react';
import './Services.css';

function Services() {
  const [activeTab, setActiveTab] = useState('residential');
  
  const residentialServices = [
    {
      id: 1,
      title: 'Standard Cleaning',
      description: 'Our standard cleaning service covers all the basics to keep your home clean and tidy on a regular basis.',
      icon: '✨',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Dusting and wiping all surfaces',
        'Vacuuming and mopping floors',
        'Cleaning bathrooms and kitchens',
        'Taking out trash and recycling',
        'Making beds and tidying up'
      ]
    },
    {
      id: 2,
      title: 'Deep Cleaning',
      description: 'Our deep cleaning service is a comprehensive clean that reaches every corner and surface of your home.',
      icon: '🧹',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Everything in standard cleaning',
        'Cleaning inside appliances',
        'Washing baseboards and door frames',
        'Cleaning light fixtures and fans',
        'Detailed bathroom and kitchen cleaning'
      ]
    },
    {
      id: 3,
      title: 'Move In/Out Cleaning',
      description: 'Moving can be stressful. Let us handle the cleaning so you can focus on settling into your new home.',
      icon: '🏠',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Deep cleaning of all rooms',
        'Cleaning inside cabinets and drawers',
        'Cleaning appliances inside and out',
        'Window cleaning including tracks',
        'Detailed floor cleaning and polishing'
      ]
    }
  ];
  
  const commercialServices = [
    {
      id: 4,
      title: 'Office Cleaning',
      description: 'Keep your workplace clean, healthy, and professional with our comprehensive office cleaning services.',
      icon: '🏢',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Dusting and cleaning all surfaces',
        'Vacuuming carpets and mopping floors',
        'Sanitizing bathrooms and kitchens',
        'Emptying trash and recycling bins',
        'Glass and window cleaning'
      ]
    },
    {
      id: 5,
      title: 'Commercial Deep Cleaning',
      description: 'A thorough cleaning service for businesses that need a comprehensive clean beyond regular maintenance.',
      icon: '🧼',
      image: 'https://images.unsplash.com/photo-1613963931023-5dc59437c8a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Everything in standard office cleaning',
        'Deep carpet cleaning and stain removal',
        'High dusting of vents and light fixtures',
        'Detailed cleaning of all appliances',
        'Sanitizing all high-touch surfaces'
      ]
    },
    {
      id: 6,
      title: 'Specialized Cleaning',
      description: 'Custom cleaning solutions for specific industries including medical offices, restaurants, and retail spaces.',
      icon: '🔬',
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Industry-specific cleaning protocols',
        'Compliance with health regulations',
        'Use of specialized cleaning agents',
        'Trained staff for your industry',
        'Flexible scheduling options'
      ]
    }
  ];
  
  const services = activeTab === 'residential' ? residentialServices : commercialServices;

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="section-title">
          <h2>Our Cleaning Services</h2>
          <p>We offer a variety of cleaning services to meet your needs, whether you're looking for residential or commercial cleaning.</p>
        </div>
        
        <div className="services-tabs">
          <button 
            className={`tab-button ${activeTab === 'residential' ? 'active' : ''}`}
            onClick={() => setActiveTab('residential')}
          >
            Residential Services
          </button>
          <button 
            className={`tab-button ${activeTab === 'commercial' ? 'active' : ''}`}
            onClick={() => setActiveTab('commercial')}
          >
            Commercial Services
          </button>
        </div>
        
        <div className="services-grid">
          {services.map(service => (
            <div className="service-card" key={service.id}>
              <div className="service-image">
                <img src={service.image} alt={service.title} />
                <div className="service-icon">{service.icon}</div>
              </div>
              <div className="service-content">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href="#estimate-calculator" className="service-cta">Get a Quote</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services; 